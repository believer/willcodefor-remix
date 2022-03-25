import { Outlet } from "remix";
import Layout from "~/components/Layout";

export default function PostsPage() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
