function HeaderLine({
  font,
  value,
  color,
  size,
  imp,
  classLine,
  classText,
  center,
  invisible,
}: any) {
  return (
    <>
      <span
        className={`text-${size || "lg"} ${classText}
    ${center ? "text-center w-full" : ""} 
    inline-block font-${font || "bold"} text-${color || "white"}`}
      >
        {imp && <span className="text-red-600">* </span>} {value}
      </span>
      {!invisible && (
        <hr className={`${classLine ? classLine : "border-2 mt-1 mb-4"}`} />
      )}
    </>
  );
}

export default HeaderLine;
