import { Outlet } from "@remix-run/react";
import Layout from '~/components/Layout'

export default function TagsPage() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
