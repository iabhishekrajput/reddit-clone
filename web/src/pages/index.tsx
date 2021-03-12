import { NavBar } from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetAllPostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = useGetAllPostsQuery();
  return (
    <>
      <NavBar />
      <div>Hello World</div>
      {!data ? (
        <div>Loading</div>
      ) : (
        data.getAllPosts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
