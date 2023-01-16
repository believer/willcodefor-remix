import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { createUserSession, login } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const password = form.get('password')

  if (!password || typeof password !== 'string') {
    return json(
      {
        message: 'Password is required',
      },
      { status: 400 }
    )
  }

  const user = await login(password)

  if (!user) {
    return json(
      {
        message: 'Not logged in',
      },
      { status: 400 }
    )
  }

  return createUserSession()
}

export default function AdminIndex() {
  const actionData = useActionData<{ message: string }>()

  return (
    <Form className="mx-auto mt-10 max-w-xl" method="post">
      <input
        className="w-full px-2 py-1 focus:outline-none dark:bg-gray-800"
        type="password"
        name="password"
      />
      <button
        className="mt-2 rounded-sm bg-blue-700 px-2 py-1 text-white focus:outline-none"
        type="submit"
      >
        Submit
      </button>

      <div>
        {actionData?.message ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {actionData?.message}
          </p>
        ) : null}
      </div>
    </Form>
  )
}
