import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { SliderSlide } from "@/hooks/useSecondHomePageData";

const AUTO_SLIDE_INTERVAL_MS = 5000;

interface SecondHomeSliderProps {
  slides: SliderSlide[];
  hideTitle?: boolean;
}

function isExternalHref(href: string): boolean {
  const t = href.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

function hasCtaLink(slide: SliderSlide): boolean {
  const link = (slide.ctaHref ?? "").trim();
  return link.length > 0 && link !== "#";
}

export function SecondHomeSlider({ slides, hideTitle }: SecondHomeSliderProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!api) return;
    const t = setInterval(() => api.scrollNext(), AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [api]);

  const handleSlideClick = (href: string) => {
    if (!href) return;
    if (isExternalHref(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(href);
    }
  };

  if (!slides.length) return null;
  return (
    <section className="w-full border-b border-white/10">
      <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide) => {
            const clickable = hasCtaLink(slide);
            const href = (slide.ctaHref ?? "").trim();
            const ctaLabel = (slide.ctaText ?? "").trim();
            const content = (
              <div className="relative flex min-h-[280px] md:min-h-[380px] w-full items-center justify-between gap-6 px-4 py-8 md:px-8 md:py-12 rounded-none">
                {slide.image && (
                  <div className="absolute inset-0 overflow-hidden rounded-none">
                    <img src={slide.image} alt="" className="h-full w-full object-fill" />
                  </div>
                )}
                <div className="relative z-10 flex flex-1 flex-col md:flex-row md:items-center md:justify-between gap-6 container">
                  {!hideTitle && (
                    <div className="flex-1">
                      <h2 className="font-bold text-xl md:text-2xl uppercase tracking-wide leading-tight text-primary-foreground">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-primary-foreground/90 text-sm mt-2">{slide.subtitle}</p>
                      )}
                    </div>
                  )}
                  {clickable && ctaLabel && (
                    <span className="flex-shrink-0 inline-flex bg-white text-primary font-bold px-8 h-12 rounded-md items-center justify-center">
                      {slide.ctaText}
                    </span>
                  )}
                </div>
              </div>
            );
            return (
              <CarouselItem key={slide.id}>
                {clickable ? (
                  <div
                    role="button"
                    tabIndex={0}
                    className="block cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSlideClick(href);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSlideClick(href);
                      }
                    }}
                  >
                    {content}
                  </div>
                ) : (
                  content
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 glass border-white/10 text-foreground hover:bg-white/5" />
        <CarouselNext className="right-2 glass border-white/10 text-foreground hover:bg-white/5" />
      </Carousel>
    </section>
  );
}
