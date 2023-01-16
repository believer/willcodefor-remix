import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { createUserSession, login } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const password = form.get('password')

  if (typeof password !== 'string') {
    return json(
      {
        message: 'Password is required',
      },
      { status: 400 }
    )
  }

  const user = await login(password)

  if (!user) {
    return null
  }

  return createUserSession()
}

export default function AdminIndex() {
  return (
    <Form method="post">
      <input
        className="w-full px-2 py-1 focus:outline-none dark:bg-gray-800"
        type="password"
        name="password"
      />
      <button type="submit">Submit</button>
    </Form>
  )
}
