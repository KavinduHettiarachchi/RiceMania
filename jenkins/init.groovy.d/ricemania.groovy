// Runs on every Jenkins start (mounted by jenkins/compose.yaml).
// - Syncs the app's .env.local into the "ricemania-env" secret file credential.
// - Creates the "ricemania" pipeline job if it doesn't exist yet.
// The Docker Hub credential is added by hand so the token never sits in a file.
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.CredentialsScope
import com.cloudbees.plugins.credentials.SecretBytes
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.GitSCM
import jenkins.model.Jenkins
import org.jenkinsci.plugins.plaincredentials.impl.FileCredentialsImpl
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import org.jenkinsci.plugins.workflow.job.WorkflowJob

def jenkins = Jenkins.get()

def envFile = new File('/run/secrets/ricemania.env')
if (envFile.isFile()) {
    def store = SystemCredentialsProvider.getInstance().getStore()
    def cred = new FileCredentialsImpl(CredentialsScope.GLOBAL, 'ricemania-env',
            'RiceMania .env.local', '.env.local', SecretBytes.fromBytes(envFile.bytes))
    def existing = CredentialsProvider.lookupCredentials(FileCredentialsImpl, jenkins)
            .find { it.id == 'ricemania-env' }
    if (existing) {
        store.updateCredentials(Domain.global(), existing, cred)
    } else {
        store.addCredentials(Domain.global(), cred)
    }
    println 'ricemania: synced ricemania-env credential'
}

if (jenkins.getItem('ricemania') == null) {
    def scm = new GitSCM(
            GitSCM.createRepoList('https://github.com/KavinduHettiarachchi/RiceMania.git', null),
            [new BranchSpec('*/main')], null, null, [])
    def definition = new CpsScmFlowDefinition(scm, 'Jenkinsfile')
    definition.lightweight = true
    def job = jenkins.createProject(WorkflowJob, 'ricemania')
    job.definition = definition
    job.save()
    println 'ricemania: created pipeline job'
}
