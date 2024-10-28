import TableContain from "../components/TableContain";
import axios from "axios";
import { useQuery } from "react-query";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Shop() {
  const shop = localStorage.getItem("shop");
  const navigate = useNavigate();
  const goBackHandler = () => navigate("/");

  const { isLoading, error, data } = useQuery(
    "storeData",
    async () => {
      let config = {
        method: "get",
        url: `http://localhost:3000/api/data`,
        params: { shop },
      };
      const { data } = await axios(config);
      return data;
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <>
      <div className="bg-gray-900">
        <h1 className="text-white text-center text-2xl">Welcome To Your Store</h1>
        <div>
          {isLoading ? (
            <CircularProgress color="secondary" />
          ) : error ? (
            <div className="flex flex-col justify-center items-center min-h-screen">
              <div className="flex justify-center items-center">
                <div className="text-white text-center text-2xl">
                  Something Went Wrong
                </div>
              </div>
              <button
                className="m-4 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-200 ease-in-out"
                onClick={goBackHandler}
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center min-h-screen">
              <div className="flex justify-center items-center">
                <TableContain data={data} />
              </div>
              <button
                className="mb-4 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-200 ease-in-out"
                onClick={goBackHandler}
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Shop;
