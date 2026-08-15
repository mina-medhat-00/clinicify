import { GridLoader } from "react-spinners";

const Loader = ({ gray }: any) => {
  return (
    <div className="my-4 flex w-full items-center justify-center">
      <GridLoader color={gray ? "#4a5568" : "#2b6cb0"} />
    </div>
  );
};

export default Loader;
