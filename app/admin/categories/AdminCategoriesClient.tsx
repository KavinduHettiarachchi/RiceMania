"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DishArt from "@/app/components/DishArt";
import FoodImage from "@/app/components/FoodImage";
import ImageUploader from "@/app/components/ImageUploader";
import { api } from "@/app/lib/api";
import { categoryId, type Category, type Food } from "@/app/lib/types";
import { useToast } from "@/app/providers/ToastProvider";

export default function AdminCategoriesClient() {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Category | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [categoriesRes, foodsRes] = await Promise.all([
        api<{ categories: Category[] }>("/categories"),
        api<{ foods: Food[] }>("/foods"),
      ]);
      setCategories(categoriesRes.categories);
      setFoods(foodsRes.foods);
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Loading from the API on mount; state is set from the async result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  /** Dish count per category — drives the delete warning. */
  const countBy = useMemo(() => {
    const map = new Map<string, number>();
    for (const food of foods) {
      const id = categoryId(food.category);
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [foods]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setImage(null);
    setPanelOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setImage(category.image);
    setPanelOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast("Give the category a name", "error");
      return;
    }

    setSaving(true);
    const body = { name: name.trim(), image };

    try {
      if (editing) {
        await api(`/categories/${editing._id}`, {
          method: "PUT",
          auth: true,
          body,
        });
        toast(`${body.name} updated`);
      } else {
        await api("/categories", { method: "POST", auth: true, body });
        toast(`${body.name} created`);
      }

      setPanelOpen(false);
      await load();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);
    try {
      await api(`/categories/${toDelete._id}`, { method: "DELETE", auth: true });
      toast(`${toDelete.name} deleted`);
      setToDelete(null);
      await load();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-full shimmer" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 rounded-3xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const deleteCount = toDelete ? (countBy.get(toDelete._id) ?? 0) : 0;

  return (
    <div className="space-y-7">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.4rem]">
            Categories
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            How the menu is grouped on the site.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-carrot-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path
              d="M8 3.5v9M3.5 8h9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          New category
        </button>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
          <DishArt name="no categories" className="mx-auto size-24 rounded-full" />
          <p className="mt-5 font-display text-lg font-semibold text-ink-900">
            No categories yet
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-400">
            Categories group the menu — rice &amp; curry, kottu, biryani, short
            eats. Add one to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 rounded-full bg-carrot-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-carrot-600"
          >
            Create the first one
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => {
            const count = countBy.get(category._id) ?? 0;

            return (
              <li
                key={category._id}
                className="animate-rise group overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white transition-all duration-400 hover:-translate-y-1 hover:border-carrot-200 hover:shadow-xl hover:shadow-ink-900/[0.06]"
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-carrot-50">
                  <FoodImage
                    src={category.image}
                    name={category.name}
                    sizes="(max-width: 640px) 90vw, 300px"
                    className="size-full"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold text-ink-900">
                      {category.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {count} {count === 1 ? "dish" : "dishes"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      aria-label={`Edit ${category.name}`}
                      className="grid size-9 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-carrot-50 hover:text-carrot-600"
                    >
                      <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                        <path
                          d="M13.5 3.5 16.5 6.5M4 16h3l9-9-3-3-9 9z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setToDelete(category)}
                      aria-label={`Delete ${category.name}`}
                      className="grid size-9 place-items-center rounded-xl text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                        <path
                          d="M4 6h12M8 6V4.5h4V6M6 6l.7 10h6.6L14 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* editor panel */}
      <div
        onClick={() => !saving && setPanelOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[70] bg-ink-950/50 backdrop-blur-[2px] transition-opacity duration-400 ${
          panelOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label={editing ? "Edit category" : "New category"}
        aria-hidden={!panelOpen}
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-[min(100vw,26rem)] flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {editing ? "Edit category" : "New category"}
          </h2>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path
                d="m4 4 8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <form onSubmit={save} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-4 p-6">
            <ImageUploader
              value={image}
              onChange={setImage}
              label="Category image"
            />

            <div>
              <label
                htmlFor="category-name"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                Name
              </label>
              <input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Rice & curry"
                required
                className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
              />
            </div>
          </div>

          <footer className="flex gap-3 border-t border-ink-100 bg-cream/60 px-6 py-5">
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              disabled={saving}
              className="flex-1 rounded-full border border-ink-200 bg-white py-3.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-carrot-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:bg-carrot-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </button>
          </footer>
        </form>
      </aside>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? "this category"}?`}
        body={
          deleteCount > 0
            ? `${deleteCount} ${deleteCount === 1 ? "dish is" : "dishes are"} still in this category and will lose their grouping on the menu. Move them first if you'd rather not.`
            : "Nothing is using this category, so it's safe to remove."
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
