type Props = {
  page: number;
  totalPages: number;
  hrefForPage: (p: number) => string;
  pageSize: number;
};

export function PageNation({ page, totalPages, hrefForPage, pageSize }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <a
          href={hrefForPage(page - 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          ← 前へ
        </a>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm opacity-50">
          ← 前へ
        </span>
      )}

      <div className="flex items-center gap-1">
        {(() => {
          const max = pageSize;
          const half = Math.floor(max / 2);
          let start = Math.max(1, page - half);
          const end = Math.min(totalPages, start + max - 1);
          start = Math.max(1, end - max + 1);

          const pages: number[] = [];
          for (let p = start; p <= end; p++) pages.push(p);

          return pages.map((p) => (
            <a
              key={p}
              href={hrefForPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "rounded-md border px-3 py-2 text-sm font-medium bg-black text-white"
                  : "rounded-md border px-3 py-2 text-sm hover:bg-muted"
              }
            >
              {p}
            </a>
          ));
        })()}
      </div>

      {page < totalPages ? (
        <a
          href={hrefForPage(page + 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          次へ →
        </a>
      ) : (
        <span className="rounded-md border px-3 py-2 text-sm opacity-50">
          次へ →
        </span>
      )}

      <span className="ml-3 text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
    </nav>
  );
}
