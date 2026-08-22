import { Children, useEffect, useState } from "react";
import { cx } from "@/components/ui/kit/cx";

function Carousel({
  children,
  autoplay,
  autoplaySpeed = 3000,
  dotPlacement = "bottom",
  dots,
  className,
}: any) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);

  useEffect(
    function () {
      if (!autoplay || slides.length < 2) return;
      const id = setInterval(function () {
        setIndex(function (current) {
          return (current + 1) % slides.length;
        });
      }, autoplaySpeed);
      return function () {
        clearInterval(id);
      };
    },
    [autoplay, autoplaySpeed, slides.length],
  );

  return (
    <div className={cx("relative overflow-hidden", className)}>
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map(function (slide, slideIndex) {
          return (
            <div key={slideIndex} className="w-full shrink-0">
              {slide}
            </div>
          );
        })}
      </div>
      {dots !== false && slides.length > 1 ? (
        <div
          className={cx(
            "absolute flex justify-center gap-1",
            dotPlacement === "bottom"
              ? "inset-x-0 bottom-2"
              : "inset-x-0 top-2",
            dots?.className,
          )}
        >
          {slides.map(function (_: any, slideIndex: number) {
            return (
              <button
                type="button"
                key={slideIndex}
                className={cx(
                  "size-2 rounded-full",
                  index === slideIndex ? "bg-white" : "bg-white/40",
                )}
                onClick={function () {
                  setIndex(slideIndex);
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { Carousel };
