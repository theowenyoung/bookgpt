import { dirname } from "https://deno.land/std@0.179.0/path/mod.ts";
export async function fetchBook() {
  const openAIKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const bookName = "Middlemarch";

  const zhBookName = "米德尔马契";

  const author = "George Eliot";

  const allPrompts = [];
  const prefixMessages = getPrefixMessages();
  const prompts = getPrompts();
  for (const prompt of prompts) {
    allPrompts.push([]);

    allPrompts[allPrompts.length - 1].push(...prefixMessages, prompt);
  }

  // replace {{}} to book name

  const finalPrompts = allPrompts.map((prompt) => {
    return prompt.map((p) => {
      return {
        ...p,
        content: p.content.replace("{{title}}", bookName),
      };
    });
  });
  // console.log("finalPrompts", finalPrompts);
  let markdown = `---
title: "${zhBookName}(${bookName})"
description: "作者： ${author}"
draft: false
taxonomies:
  tags:
    - "分类"
extra:
  feature_image: "Float.svg"
  feature: true
  link: ""
---

`;

  for (const rawPrompt of finalPrompts) {
    const prompt = rawPrompt.map((p) => {
      return {
        role: p.role,
        content: p.content,
      };
    });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: prompt,
      }),
    });
    const data = await response.json();
    console.log(data);
    const { choices } = data;
    const { content } = choices[0].message;
    console.log("content", content);
    // write text to
    // let text = "test 22222";
    const theFirstQuestionPrompt = rawPrompt[prefixMessages.length];

    markdown += `## ${theFirstQuestionPrompt.zh}

${content}
`;
  }
  // write markdown to file
  // content/blog/2020/2020-06-15-title.md

  const filepath = "content/blog/2020/2020-06-16-title/index.md";
  const parentDir = dirname(filepath);
  // ensure parent exists
  await Deno.mkdir(parentDir, { recursive: true });
  await Deno.writeTextFile(filepath, markdown);
}

fetchBook();

export function getPrefixMessages() {
  return [
    {
      role: "system",
      content: "You are a reading assistant",
    },

    {
      role: "user",
      content: "The name of the book is ```{{title}}```",
    },
  ];
}

export function getPrompts() {
  return [
    {
      role: "user",
      content:
        "Give me 5 reasons why I should read this book, and attach a Chinese translation of that response below each answer, please use markdown format",
      zh: "读这本书的5个理由？",
    },
    {
      role: "user",
      content:
        "List 15 original texts from the book that were liked and highlighted by many people, and attach a Chinese translation of that response below each answer, please use markdown format",
      zh: "请列出 15 条这本书值得高亮的段落",
    },
    {
      role: "user",
      content:
        "Please describe the book in no less than 1000 words so that I don't have to read it myself, and attach a Chinese translation of that response below each answer, please use markdown format",
      zh: "请用通俗的语言介绍这本书的重点内容",
    },

    {
      role: "user",
      content:
        "Please suggest 5 topics that would be suitable for discussion in a book club about the content of the book, and attach a Chinese translation of that response below each answer, please use markdown format",
      zh: "适合在读书会上讨论的5个话题？",
    },

    {
      role: "user",
      content:
        "Please provide 5 similar books and briefly introduce them., and attach a Chinese translation of that response below each answer, please use markdown format",
      zh: "请提供5本类似的书籍，并简要介绍它们",
    },
  ];
}

//
