const fs = require('fs');
const path = 'src/components/Layout/UserHeader.tsx';
let content = fs.readFileSync(path, 'utf8');
const oldSearch =           <div class= flex-1>
    
              <div class=mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all duration-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100>
                <input
                  type=search
                  placeholder=Search salons gyms restaurants events...
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === Enter && handleSearch()
                  }
                  className=w-full bg-transparent px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none
                  aria-label=Search
                />
                <button
                  type=button
                  onClick={handleSearch}
                  className=rounded-full bg-blue-500 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600
                >
                  Search
                </button>
              </div>
            
          </div>;
const newSearch =           <div class=flex flex-1 items-center gap-4>
            <div class=flex-1>
              <div class=mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-all duration-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100>
                <input
                  type=search
                  placeholder=Search salons gyms restaurants events...
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === Enter && handleSearch()
                  }
                  className=w-full bg-transparent px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none
                  aria-label=Search
                />
                <button
                  type=button
                  onClick={handleSearch}
                  className=rounded-full bg-blue-500 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600
                >
                  Search
                </button>
              </div>
            </div>
            <button
              type=button
              className=inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 lg:hidden
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
            >
              <Sparkles className=h-4 w-4 />
              Menu
            </button>
          </div>;
if (!content.includes(oldSearch)) {
  throw new Error('search block missing');
}
content = content.replace(oldSearch, newSearch);
const navOld =           <div
            ref={navContainerRef}
            className=relative mx-auto flex w-full max-w-8xl flex-wrap items-center justify-center gap-6 overflow-x-auto px-4 py-2 sm:px-6
          >;
const navNew =           <div
            ref={navContainerRef}
            className=relative mx-auto hidden w-full max-w-8xl flex-wrap items-center justify-center gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:flex
          >;
if (!content.includes(navOld)) {
  throw new Error('nav block missing');
}
content = content.replace(navOld, navNew);
const navTailOld =           ) : null}
          </AnimatePresence>
        </div>
      </div>;
const navTailNew =           ) : null}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.div
              key=mobile-nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className=fixed inset-x-0 z-40 rounded-b-3xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden
            >
              <div className=flex flex-wrap justify-between gap-3>
                {masterCategories.map((master) => {
                  const planned = plannedCategoryMap.get(master.slug);
                  const IconComponent = planned?.icon;
                  return (
                    <NavLink
                      key={master.slug}
                      to={/services/}
                      className={({ isActive }) =>
                        cn(
                          inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700,
                          isActive && border-blue-200 bg-blue-50 text-blue-700,
                        )
                      }
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <span className=flex h-7 w-7 items-center justify-center rounded-full bg-slate-100>
                        {IconComponent ? (
                          <IconComponent className=h-4 w-4 text-slate-500 />
                        ) : (
                          <Sparkles className=h-4 w-4 text-slate-500 />
                        )}
                      </span>
                      {master.name}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>;
if (!content.includes(navTailOld)) {
  throw new Error('nav tail missing');
}
content = content.replace(navTailOld, navTailNew);
fs.writeFileSync(path, content, 'utf8');
