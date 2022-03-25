import fm from "front-matter";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { prisma } from "./app/db.server";

async function* getFiles(dir: string): any {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

const imageExtensions = [".png", ".jpg"];

const obsidianLinkToMarkdownLink =
  (allFilenames: Array<string>) => (match: string) => {
    let title = match.replace(/[[\]]/g, "");

    if (imageExtensions.some((i) => title.includes(i))) {
      title = title.replace("!", "");
      const [filename] = title.split(".");
      return `![${filename}](/${title})`;
    }

    if (title.includes("|")) {
      title = title.split("|")[1];
    }

    if (!allFilenames.includes(title)) {
      return title;
    }

    return `[${title}](/posts/${title
      .toLowerCase()
      .replace(/ - /g, " ")
      .replace(/\s/g, "-")
      .replace(/[*'"]/g, "")})`;
  };

(async () => {
  for await (const f of getFiles(
    "/Users/rdag/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes"
  )) {
    const data = await readFile(f, "utf8");
    const { attributes, body } = fm<{
      body: string;
      excerpt: string;
      tags: Array<string>;
      title: string;
      series?: string;
    }>(data);

    if (attributes.tags?.includes("til") && attributes.title) {
      const metadata = await stat(f);

      const slug = path
        .basename(f, ".md")
        .toLowerCase()
        .replace(/ - /g, " ")
        .replace(/\s/g, "-")
        .replace(/[*']/g, "");

      const parsedBody = body.replace(
        /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
        obsidianLinkToMarkdownLink([])
      );

      await prisma.post.upsert({
        where: {
          slug: slug,
        },
        update: {
          slug,
          title: attributes.title,
          excerpt: attributes.excerpt,
          body: parsedBody,
          createdAt: metadata.birthtime,
          updatedAt: metadata.mtime,
          series: attributes.series,
        },
        create: {
          slug,
          title: attributes.title,
          excerpt: attributes.excerpt,
          body: parsedBody,
          createdAt: metadata.birthtime,
          updatedAt: metadata.mtime,
          series: attributes.series,
        },
      });

      console.log(slug);
    }
  }

  for await (const f of getFiles("./data")) {
    const data = await readFile(f, "utf8");
    const { attributes, body } = fm<{
      modifiedDateTime: string;
      createdDateTime: string;
      body: string;
      excerpt: string;
      tags: Array<string>;
      series?: string;
      title: string;
    }>(data);

    if (attributes.tags?.includes("til") && attributes.title) {
      const slug = path
        .basename(f, ".md")
        .toLowerCase()
        .replace(/ - /g, " ")
        .replace(/\s/g, "-")
        .replace(/[*']/g, "");

      const parsedBody = body.replace(
        /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
        obsidianLinkToMarkdownLink([])
      );

      await prisma.post.upsert({
        where: {
          slug: slug,
        },
        update: {
          slug,
          title: attributes.title,
          excerpt: attributes.excerpt ?? "",
          body: parsedBody,
          createdAt: new Date(attributes.createdDateTime),
          updatedAt: new Date(attributes.modifiedDateTime),
          series: attributes.series,
        },
        create: {
          slug,
          title: attributes.title,
          excerpt: attributes.excerpt ?? "",
          body: parsedBody,
          createdAt: new Date(attributes.createdDateTime),
          updatedAt: new Date(attributes.modifiedDateTime),
          series: attributes.series,
        },
      });

      console.log(slug);
    }
  }
})();
