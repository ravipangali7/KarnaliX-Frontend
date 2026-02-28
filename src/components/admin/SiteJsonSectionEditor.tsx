/**
 * Reusable building blocks for editing site setting JSON section configs in powerhouse.
 * Each section has: section_title, section_svg (URL), and section-specific selectors.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";

interface BaseItem {
  id: number;
  name: string;
}

// -----------------------------------------------------------------------
// SectionTitleSvg – shared title + svg_url inputs
// -----------------------------------------------------------------------
interface SectionTitleSvgProps {
  sectionTitle: string;
  sectionSvg: string;
  onTitleChange: (v: string) => void;
  onSvgChange: (v: string) => void;
}

export function SectionTitleSvg({ sectionTitle, sectionSvg, onTitleChange, onSvgChange }: SectionTitleSvgProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Section title</label>
        <Input value={sectionTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g. Top Games" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Section SVG / icon URL</label>
        <Input value={sectionSvg} onChange={(e) => onSvgChange(e.target.value)} placeholder="https://... or /media/..." />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// OrderedIdSelector – select + order multiple items from a list by id
// -----------------------------------------------------------------------
interface OrderedIdSelectorProps {
  label: string;
  allItems: BaseItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function OrderedIdSelector({ label, allItems, selectedIds, onChange }: OrderedIdSelectorProps) {
  const [search, setSearch] = useState("");

  const available = allItems.filter(
    (item) => !selectedIds.includes(item.id) && item.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = selectedIds
    .map((id) => allItems.find((i) => i.id === id))
    .filter(Boolean) as BaseItem[];

  const add = (id: number) => onChange([...selectedIds, id]);
  const remove = (id: number) => onChange(selectedIds.filter((x) => x !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const n = [...selectedIds];
    [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
    onChange(n);
  };
  const moveDown = (idx: number) => {
    if (idx === selectedIds.length - 1) return;
    const n = [...selectedIds];
    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
    onChange(n);
  };

  return (
    <div className="space-y-3">
      {/* Selected items (ordered) */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Selected {label} (drag order via arrows)</p>
          {selected.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm">
              <span className="flex-1 truncate">{item.name}</span>
              <Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={idx === 0} onClick={() => moveUp(idx)}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-6 w-6" disabled={idx === selected.length - 1} onClick={() => moveDown(idx)}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => remove(item.id)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Available items */}
      <div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${label}…`}
          className="mb-2 h-8 text-sm"
        />
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {available.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => add(item.id)}
              className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
              {item.name}
            </button>
          ))}
          {available.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {allItems.length === 0 ? `No ${label} available.` : "All items selected."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// CategoryGamesEditor – categories[{category_id, game_ids}] editor
// -----------------------------------------------------------------------
export interface CategoryGamesEntry {
  category_id: number;
  game_ids: number[];
}

interface CategoryGamesEditorProps {
  allCategories: BaseItem[];
  allGames: BaseItem[];
  value: CategoryGamesEntry[];
  onChange: (v: CategoryGamesEntry[]) => void;
}

export function CategoryGamesEditor({ allCategories, allGames, value, onChange }: CategoryGamesEditorProps) {
  const usedCategoryIds = value.map((e) => e.category_id);

  const addCategory = (catId: number) => {
    onChange([...value, { category_id: catId, game_ids: [] }]);
  };
  const removeCategory = (catId: number) => onChange(value.filter((e) => e.category_id !== catId));
  const setGames = (catId: number, gameIds: number[]) =>
    onChange(value.map((e) => e.category_id === catId ? { ...e, game_ids: gameIds } : e));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const n = [...value];
    [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
    onChange(n);
  };
  const moveDown = (idx: number) => {
    if (idx === value.length - 1) return;
    const n = [...value];
    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
    onChange(n);
  };

  const availableCategories = allCategories.filter((c) => !usedCategoryIds.includes(c.id));

  return (
    <div className="space-y-4">
      {value.map((entry, idx) => {
        const cat = allCategories.find((c) => c.id === entry.category_id);
        return (
          <div key={entry.category_id} className="rounded-lg border p-4 space-y-3 bg-muted/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{cat?.name ?? `Category #${entry.category_id}`}</span>
              <div className="flex gap-1">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => moveUp(idx)}>
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={idx === value.length - 1} onClick={() => moveDown(idx)}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeCategory(entry.category_id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <OrderedIdSelector
              label="games"
              allItems={allGames}
              selectedIds={entry.game_ids}
              onChange={(ids) => setGames(entry.category_id, ids)}
            />
          </div>
        );
      })}

      {availableCategories.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Add a category section:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => addCategory(cat.id)}
                className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {availableCategories.length === 0 && allCategories.length === 0 && (
        <p className="text-xs text-muted-foreground">No categories available. Create some first.</p>
      )}
    </div>
  );
}
