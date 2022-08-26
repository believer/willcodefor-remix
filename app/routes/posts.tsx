import { Outlet } from "@remix-run/react";
import Layout from '~/components/Layout'

export default function PostsPage() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
