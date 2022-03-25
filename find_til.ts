import fm from "front-matter";
import {writeFile, readdir, readFile, stat} from "fs/promises";
import path from "path";
import {prisma} from "./app/db.server";

async function* getFiles(dir: string): any {
  const dirents = await readdir(dir, {withFileTypes: true});
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

const slugify = (filename: string) =>
  path
    .basename(filename, ".md")
    .toLowerCase()
    .replace(/ - /g, " ")
    .replace(/\s/g, "-")
    .replace(/[*']/g, "");

(async () => {
  const lastUpdate = await readFile(".til", "utf8");
  const timeUpdated = Date.parse(lastUpdate.replace(/\n/, ""));

  const postId = []

  // Import blog posts from Obsidian
  const tils = [];
  const allFilenames = [];

  type ObsidianAttributes = {
    body: string;
    excerpt: string;
    tags: Array<string>;
    title: string;
    series?: string;
  };

  console.log("============== Upload Obsidian files ==============\n");
  for await (const f of getFiles(
    "/Users/rickard/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes"
  )) {
    const data = await readFile(f, "utf8");
    const {attributes} = fm<ObsidianAttributes>(data);

    if (attributes.tags?.includes("til") && attributes.title) {
      tils.push(f);
      allFilenames.push(path.basename(f, ".md"));
    }
  }

  console.log(`Found ${tils.length} files\n`);

  for (const f of tils) {
    const fileData = await readFile(f, "utf8");
    const metadata = await stat(f);
    const {attributes, body} = fm<ObsidianAttributes>(fileData);

    const slug = slugify(f);

    postId.push({ created: metadata.birthtimeMs, slug })

    // Skip if not modified
    if (metadata.mtimeMs < timeUpdated) {
      console.log(`⎘ ${attributes.title}`);
      continue;
    }

    const parsedBody = body.replace(
      /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
      obsidianLinkToMarkdownLink(allFilenames)
    );

    const data = {
      slug,
      title: attributes.title,
      excerpt: attributes.excerpt,
      body: parsedBody,
      createdAt: metadata.birthtime,
      updatedAt: metadata.mtime,
      series: attributes.series,
      tilId: 0
    };

    await prisma.post.upsert({
      where: {
        slug: slug,
      },
      update: data,
      create: data,
    });

    console.log(`✅ ${attributes.title}`);
  }

  // Import old blog posts
  console.log("\n============== Upload old blog posts ==============\n");

  for await (const f of getFiles("./data")) {
    const data = await readFile(f, "utf8");
    const {attributes, body} = fm<{
      modifiedDateTime: string;
      createdDateTime: string;
      body: string;
      excerpt: string;
      tags: Array<string>;
      series?: string;
      title: string;
    }>(data);

    if (attributes.tags?.includes("til") && attributes.title) {
      const slug = slugify(f);

    postId.push({ created: new Date(attributes.createdDateTime).getTime(), slug })

      // Skip if not modified
      if (new Date(attributes.modifiedDateTime).getTime() < timeUpdated) {
        console.log(`⎘ ${attributes.title}`);
        continue;
      }

      const data = {
        body,
        slug,
        title: attributes.title,
        excerpt: attributes.excerpt ?? "",
        createdAt: new Date(attributes.createdDateTime),
        updatedAt: new Date(attributes.modifiedDateTime),
        series: attributes.series,
      tilId: 0
      };

      await prisma.post.upsert({
        where: {
          slug: slug,
        },
        update: data,
        create: data,
      });

    console.log(`✅ ${attributes.title}`);
    }
  }

  postId.sort((a,b) => a.created - b.created)

  // Adding TIL IDs
  for (const [i, {slug}] of postId.entries()) {
    await prisma.post.update({
      where: { slug },
      data: {
        tilId: i + 1
      }
    })
  }
  
  console.log('\nIDs updated')

  await writeFile(".til", new Date().toISOString());
})();
