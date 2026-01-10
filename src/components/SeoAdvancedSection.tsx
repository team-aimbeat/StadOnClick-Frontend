import { Switch } from "@radix-ui/react-switch";
import React from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";



type SeoAdvancedSectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  keywords: string[];
  keywordInput: string;
  keywordError?: string;
  allowIndexing: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onKeywordInputChange: (value: string) => void;
  onAddKeyword: () => void;
  onKeywordKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveKeyword: (keyword: string) => void;
  onToggleIndexing: () => void;
};

const SeoAdvancedSection: React.FC<SeoAdvancedSectionProps> = ({
  isOpen,
  onToggle,
  title,
  description,
  keywords,
  keywordInput,
  keywordError,
  allowIndexing,
  onTitleChange,
  onDescriptionChange,
  onKeywordInputChange,
  onAddKeyword,
  onKeywordKeyDown,
  onRemoveKeyword,
  onToggleIndexing,
}) => {
  const titleLength = title.length;
  const descriptionLength = description.length;
  const isTitleOptimal = titleLength >= 50 && titleLength <= 60;
  const descriptionQuality =
    descriptionLength === 0
      ? "No meta description yet"
      : descriptionLength < 50
        ? "Short description"
        : descriptionLength <= 160
          ? "Solid length"
          : "Too long";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Advanced (Optional)
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            SEO - Public Vendor Profile
          </h3>
        </div>
        <span className="text-blue-500">
          {isOpen ? <HiChevronUp className="h-5 w-5" /> : <HiChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">SEO Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Custom title for Google search results"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Google title tag (recommended 50-60 characters)</span>
              <span className={isTitleOptimal ? "text-emerald-600" : "text-slate-400"}>
                {titleLength} / 70
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">SEO Description</label>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Short summary shown in Google search results"
              rows={4}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white"
              maxLength={160}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Google meta description</span>
              <span className="text-slate-400">{descriptionLength} / 160</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {descriptionQuality}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">SEO Keywords</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(event) => onKeywordInputChange(event.target.value)}
                onKeyDown={onKeywordKeyDown}
                placeholder="Add keyword and press Enter"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white"
              />
              <button
                type="button"
                className="rounded-2xl bg-blue-600 px-4 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-blue-500"
                onClick={onAddKeyword}
              >
                Add
              </button>
            </div>
            {keywordError && <p className="text-[11px] text-rose-600">{keywordError}</p>}
            <p className="text-[11px] text-slate-500">Max 20 keywords, 2-40 characters each.</p>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => onRemoveKeyword(keyword)}
                      className="text-slate-400 transition hover:text-slate-600"
                      aria-label={`Remove ${keyword}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

         <div className="space-y-2">
  <label className="text-sm font-semibold text-slate-700">
    Search Indexing
  </label>

  <div className="flex items-center justify-between">
    <p className="text-xs text-slate-500">
      Allow search engines to index this profile
    </p>

    <Switch
      checked={allowIndexing}
      onCheckedChange={onToggleIndexing}
      className="data-[state=checked]:bg-blue-600"
    />
  </div>

  <p className="text-[11px] text-slate-500">
    Turning this off hides your profile from Google search results.
  </p>
</div>

        </div>
      )}
    </div>
  );
};

export default SeoAdvancedSection;
