import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { deletePost, editPost, getPost } from "~/models/post.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const oldSlug = formData.get("oldSlug");
  const markdown = formData.get("markdown");
  const intent = formData.get("intent");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof oldSlug === "string", "old slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");
  invariant(typeof intent === "string", "intent must be a string");

  switch (true) {
    case intent === "delete":
      await deletePost(slug);
      return redirect("/posts/admin");
    case intent === "update":
      return await editPost(oldSlug, { title, slug, markdown });
    default:
      break;
  }

  return redirect("/posts/admin");
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.slug, "params.slug is required");

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json({ post });
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function PostSlug() {
  const { post } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <main className="mx-auto max-w-4xl">
      <Form method="post" key={post.slug}>
        <p>
          <label>
            Post Title:{" "}
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
            <input
              type="text"
              defaultValue={post.title}
              name="title"
              className={inputClassName}
            />
          </label>
        </p>
        <input
          type="hidden"
          defaultValue={post.slug}
          name="oldSlug"
          className={inputClassName}
        />
        <p>
          <label>
            Post Slug:{" "}
            <input
              type="text"
              name="slug"
              defaultValue={post.slug}
              className={inputClassName}
            />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">
            Markdown:
            {errors?.markdown ? (
              <em className="text-red-600">{errors.markdown}</em>
            ) : null}
          </label>
          <br />
          <textarea
            id="markdown"
            rows={20}
            name="markdown"
            defaultValue={post.markdown}
            className={`${inputClassName} font-mono`}
          />
        </p>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
          >
            {"delete Post"}
          </button>
          <button
            type="submit"
            name="intent"
            value="update"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            {"Edit Post"}
          </button>
        </div>
      </Form>
    </main>
  );
}
