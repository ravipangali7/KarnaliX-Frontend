import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCmsPageBySlug } from "@/api/site";
import { Button } from "@/components/ui/button";

function sanitizeHtmlBasic(html: string): string {
  // Basic safety: remove script tags. (For full sanitization, add a sanitizer library.)
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

export default function CmsPage() {
  const { slug } = useParams();
  const pageSlug = (slug ?? "").trim();

  const {
    data: page,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cmsPage", pageSlug],
    queryFn: () => getCmsPageBySlug(pageSlug),
    enabled: Boolean(pageSlug),
  });

  const title = String((page as { title?: unknown } | undefined)?.title ?? "").trim() || "Page";
  const rawContent = String((page as { content?: unknown } | undefined)?.content ?? "");
  const content = sanitizeHtmlBasic(rawContent);

  if (!pageSlug) {
    return (
      <div className="container px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-2">Missing page slug.</p>
          <div className="mt-6">
            <Link to="/">
              <Button>Go home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl font-semibold">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This page may be inactive or the slug is incorrect.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>Go home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <div className="prose prose-invert max-w-none mt-6" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

