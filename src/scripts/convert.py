import os
import markdown2

# 从环境变量中获取路径
template_path = os.getenv('TEMPLATE_PATH')
markdown_path = os.getenv('MARKDOWN_PATH')
storage_path = os.getenv('STORAGE_PATH')

if not (template_path and markdown_path and storage_path):
    raise ValueError("环境变量 TEMPLATE_PATH, MARKDOWN_PATH 和 STORAGE_PATH 必须设置")

# 读取HTML模板文件
with open(template_path, "r", encoding="utf-8") as template_file:
    html_template = template_file.read()

# 通过设置 extras 参数为 "fenced-code-blocks"，启用对代码块的转换
markdown_extras = ["fenced-code-blocks", "tables"]

# 遍历 Markdown 目录中的每个md文件
for subdir, _, files in os.walk(markdown_path):
    for file in files:
        if file.endswith(".md"):
            # 获取 Markdown 文件的完整路径
            markdown_file_path = os.path.join(subdir, file)
            # 构造 HTML 文件的路径
            html_file_path = os.path.join(storage_path, os.path.splitext(file)[0] + ".html")
            # 从文件中读取 Markdown 内容
            with open(markdown_file_path, "r", encoding="utf-8") as markdown_file:
                markdown_content = markdown_file.read()

            # 使用 markdown 渲染器将 Markdown 转换成 HTML
            html_content = markdown2.markdown(markdown_content, extras=markdown_extras)
            # 通过插入到模板中来格式化最终的 HTML 内容
            final_html_content = html_template.format(content=html_content)
            # 将最终的 HTML 内容写入文件
            with open(html_file_path, "w", encoding="utf-8") as html_file:
                html_file.write(final_html_content)

print("Markdown to HTML conversion complete!")