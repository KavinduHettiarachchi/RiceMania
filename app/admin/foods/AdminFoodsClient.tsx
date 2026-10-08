"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import FoodImage from "@/app/components/FoodImage";
import ImageUploader from "@/app/components/ImageUploader";
import { api } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/format";
import { categoryId, categoryName, type Category, type Food } from "@/app/lib/types";
import { useToast } from "@/app/providers/ToastProvider";

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  image: string | null;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  available: true,
  image: null,
};

export default function AdminFoodsClient() {
  const params = useSearchParams();
  const toast = useToast();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [editing, setEditing] = useState<Food | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Food | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        api<{ foods: Food[] }>("/foods"),
        api<{ categories: Category[] }>("/categories"),
      ]);
      setFoods(foodsRes.foods);
      setCategories(categoriesRes.categories);
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

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({ ...EMPTY, category: categories[0]?._id ?? "" });
    setPanelOpen(true);
  }, [categories]);

  const openEdit = useCallback((food: Food) => {
    setEditing(food);
    setForm({
      name: food.name,
      description: food.description ?? "",
      price: String(food.price),
      category: categoryId(food.category) ?? "",
      available: food.available,
      image: food.image,
    });
    setPanelOpen(true);
  }, []);

  // Deep links from the dashboard (?new=1) and the food page (?edit=<id>).
  // Opens the panel on the frame after the data lands, so the initial render
  // isn't interrupted by a state change.
  useEffect(() => {
    if (loading) return;

    const id = requestAnimationFrame(() => {
      if (params.get("new") === "1") {
        openCreate();
        return;
      }

      const editId = params.get("edit");
      if (editId) {
        const target = foods.find((food) => food._id === editId);
        if (target) openEdit(target);
      }
    });

    return () => cancelAnimationFrame(id);
    // Runs once the data is in; the panel manages its own state after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    const price = Number(form.price);

    if (!form.name.trim()) return toast("Give the dish a name", "error");
    if (!form.category) return toast("Pick a category", "error");
    if (Number.isNaN(price) || price < 0)
      return toast("Enter a valid price", "error");

    setSaving(true);

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      available: form.available,
      image: form.image,
    };

    try {
      if (editing) {
        await api(`/foods/${editing._id}`, {
          method: "PUT",
          auth: true,
          body,
        });
        toast(`${body.name} updated`);
      } else {
        await api("/foods", { method: "POST", auth: true, body });
        toast(`${body.name} added to the menu`);
      }

      setPanelOpen(false);
      await load();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  /** Optimistic on/off switch straight from the table row. */
  const toggleAvailable = async (food: Food) => {
    const next = !food.available;

    setTogglingId(food._id);
    setFoods((current) =>
      current.map((item) =>
        item._id === food._id ? { ...item, available: next } : item
      )
    );

    try {
      await api(`/foods/${food._id}`, {
        method: "PUT",
        auth: true,
        body: { available: next },
      });
      toast(
        next
          ? `${food.name} is back on the menu`
          : `${food.name} is off the menu today`
      );
    } catch (error) {
      toast((error as Error).message, "error");
      await load();
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);
    try {
      await api(`/foods/${toDelete._id}`, { method: "DELETE", auth: true });
      toast(`${toDelete.name} removed`);
      setToDelete(null);
      await load();
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return foods.filter((food) => {
      if (filterCategory !== "all" && categoryId(food.category) !== filterCategory)
        return false;
      if (needle && !food.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [foods, query, filterCategory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 rounded-full shimmer" />
        <div className="h-96 rounded-3xl shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[2rem] font-normal leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.4rem]">
            Menu items
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {foods.length} {foods.length === 1 ? "dish" : "dishes"} on the menu
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={categories.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-carrot-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-carrot-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-carrot-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path
              d="M8 3.5v9M3.5 8h9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Add a dish
        </button>
      </header>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Create a category first — every dish needs one before it can go on the
          menu.
        </div>
      )}

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-300"
            aria-hidden
          >
            <circle
              cx="7"
              cy="7"
              r="4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m10.5 10.5 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dishes"
            className="w-full rounded-full border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
          aria-label="Filter by category"
          className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-carrot-400"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white px-8 py-20 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">
            {foods.length === 0 ? "No dishes yet" : "Nothing matches"}
          </p>
          <p className="mt-1.5 text-sm text-ink-400">
            {foods.length === 0
              ? "Add your first dish and it appears on the site immediately."
              : "Try a different search or category."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left">
              <thead>
                <tr className="border-b border-ink-100 text-[0.68rem] uppercase tracking-[0.14em] text-ink-400">
                  <th className="px-6 py-4 font-semibold">Dish</th>
                  <th className="px-4 py-4 font-semibold">Category</th>
                  <th className="px-4 py-4 text-right font-semibold">Price</th>
                  <th className="px-4 py-4 font-semibold">On the menu</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-100">
                {visible.map((food) => (
                  <tr
                    key={food._id}
                    className="group transition-colors hover:bg-cream/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FoodImage
                          src={food.image}
                          name={food.name}
                          sizes="48px"
                          className="size-12 shrink-0 overflow-hidden rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {food.name}
                          </p>
                          {food.description && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-ink-400">
                              {food.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-ink-500">
                      {categoryName(food.category)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums text-ink-900">
                      {formatPrice(food.price)}
                    </td>

                    <td className="px-4 py-4">
                      {/* Flip a dish on or off without opening the editor —
                          the move a kitchen makes most often. */}
                      <label
                        className={`flex w-fit cursor-pointer items-center gap-2.5 ${
                          togglingId === food._id ? "opacity-50" : ""
                        }`}
                      >
                        <span className="relative inline-flex">
                          <input
                            type="checkbox"
                            checked={food.available}
                            disabled={togglingId === food._id}
                            onChange={() => toggleAvailable(food)}
                            className="peer sr-only"
                          />
                          <span className="block h-6 w-11 rounded-full bg-ink-200 transition-colors duration-300 peer-checked:bg-emerald-500" />
                          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5" />
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            food.available ? "text-emerald-700" : "text-ink-400"
                          }`}
                        >
                          {food.available ? "Serving" : "Off today"}
                        </span>
                      </label>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(food)}
                          aria-label={`Edit ${food.name}`}
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
                          onClick={() => setToDelete(food)}
                          aria-label={`Delete ${food.name}`}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
        aria-label={editing ? "Edit dish" : "Add a dish"}
        aria-hidden={!panelOpen}
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-[min(100vw,30rem)] flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {editing ? "Edit dish" : "Add a dish"}
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

        <form
          onSubmit={save}
          className="flex flex-1 flex-col overflow-y-auto"
          noValidate
        >
          <div className="flex-1 space-y-4 p-6">
            <ImageUploader
              value={form.image}
              onChange={(image) => setForm((f) => ({ ...f, image }))}
            />

            <div>
              <label
                htmlFor="food-name"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                Dish name
              </label>
              <input
                id="food-name"
                value={form.name}
                onChange={(event) =>
                  setForm((f) => ({ ...f, name: event.target.value }))
                }
                placeholder="Chicken rice & curry"
                required
                className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="food-description"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                Description
              </label>
              <textarea
                id="food-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((f) => ({ ...f, description: event.target.value }))
                }
                placeholder="What's on the plate, and what makes it good."
                className="mt-2 w-full resize-none rounded-2xl border border-ink-200 px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="food-price"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                Price (LKR)
              </label>
              <input
                id="food-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm((f) => ({ ...f, price: event.target.value }))
                }
                placeholder="850"
                required
                className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3.5 text-sm outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="food-category"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500"
              >
                Category
              </label>
              <select
                id="food-category"
                value={form.category}
                onChange={(event) =>
                  setForm((f) => ({ ...f, category: event.target.value }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:border-carrot-400 focus:ring-4 focus:ring-carrot-500/10"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-ink-200 px-4 py-3.5">
              <span>
                <span className="block text-sm font-semibold text-ink-900">
                  Serving today
                </span>
                <span className="mt-0.5 block text-xs text-ink-400">
                  Turn this off and the dish shows as unavailable, and can&apos;t
                  be ordered.
                </span>
              </span>

              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, available: event.target.checked }))
                  }
                  className="peer sr-only"
                />
                <span className="block h-6 w-11 rounded-full bg-ink-200 transition-colors duration-300 peer-checked:bg-carrot-500" />
                <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5" />
              </span>
            </label>
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
              {saving ? "Saving…" : editing ? "Save changes" : "Add to menu"}
            </button>
          </footer>
        </form>
      </aside>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? "this dish"}?`}
        body="It comes off the menu straight away. Past orders keep their record of it."
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
