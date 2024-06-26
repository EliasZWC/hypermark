from PyQt6.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QFileDialog, QMessageBox, QLineEdit
from PyQt6.QtCore import Qt
from PyQt6 import uic
import sys
import os
import markdown2

# 存储选择的路径
selected_template_path = ""
selected_markdown_dir = ""
CONFIG_FILENAME = "config.txt"


def selectTemplate():
    global selected_template_path
    path, _ = QFileDialog.getOpenFileName(filter="HTML Files (*.html *.htm)")
    if path:
        selected_template_path = path
        ui.edit1.setText(selected_template_path)  # 更新 QLineEdit
        QMessageBox.information(None, "Template Selected", f"Template path:\n{path}")
        save_paths()  # 保存路径
    else:
        QMessageBox.warning(None, "No File Selected", "No template file was selected.")


def selectSource():
    global selected_markdown_dir
    path = QFileDialog.getExistingDirectory()
    if path:
        selected_markdown_dir = path
        ui.edit2.setText(selected_markdown_dir)  # 更新 QLineEdit
        QMessageBox.information(None, "MD Source Directory Selected", f"Source directory:\n{path}")
        save_paths()  # 保存路径
    else:
        QMessageBox.warning(None, "No Directory Selected", "No MD source directory was selected.")


def convert():
    if selected_markdown_dir and selected_template_path:
        html_dir = os.path.join(selected_markdown_dir, "html")
        if not os.path.exists(html_dir):
            os.makedirs(html_dir)

        with open(selected_template_path, "r", encoding="utf-8") as template_file:
            html_template = template_file.read()

        markdown_extras = ["fenced-code-blocks", "tables"]

        for subdir, _, files in os.walk(selected_markdown_dir):
            for file in files:
                if file.endswith(".md"):
                    markdown_file_path = os.path.join(subdir, file)
                    html_file_path = os.path.join(html_dir, os.path.splitext(file)[0] + ".html")

                    with open(markdown_file_path, "r", encoding="utf-8") as markdown_file:
                        markdown_content = markdown_file.read()

                    html_content = markdown2.markdown(markdown_content, extras=markdown_extras)
                    final_html_content = html_template.format(content=html_content)

                    with open(html_file_path, "w", encoding="utf-8") as html_file:
                        html_file.write(final_html_content)

        QMessageBox.information(None, "Transform Successfully", f"Storage directory:\n{html_dir}")
    else:
        QMessageBox.warning(None, "Missing Information", "Please select both a template and a source directory.")


def save_paths():
    with open(CONFIG_FILENAME, "w", encoding="utf-8") as config_file:
        config_file.write(selected_template_path + '\n')
        config_file.write(selected_markdown_dir)


def load_paths(ui):
    try:
        with open(CONFIG_FILENAME, "r", encoding="utf-8") as config_file:
            paths = config_file.readlines()
            global selected_template_path, selected_markdown_dir
            if len(paths) >= 2:
                selected_template_path = paths[0].strip()
                selected_markdown_dir = paths[1].strip()
                ui.edit1.setText(selected_template_path)
                ui.edit2.setText(selected_markdown_dir)
    except FileNotFoundError:
        pass


if __name__ == '__main__':
    app = QApplication(sys.argv)

    with open("style.css", "r", encoding="utf-8") as file:
        stylesheet = file.read()  # 读取并存储stylesheet
        app.setStyleSheet(stylesheet)

    ui = uic.loadUi('./main.ui')

    load_paths(ui)

    # 设置视窗背景透明
    ui.setWindowFlags(ui.windowFlags() | Qt.WindowType.FramelessWindowHint)
    ui.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
    backgroundWidget = QWidget(ui)
    backgroundWidget.setObjectName("backgroundWidget")
    backgroundWidget.setGeometry(0, 0, ui.width(), ui.height())
    layout = QVBoxLayout(ui)
    layout.addWidget(backgroundWidget)
    backgroundWidget.lower()

    # 关闭窗口
    close: QPushButton = ui.closeBtn
    close.clicked.connect(lambda: ui.close())

    # 选择HTML模板文件
    template: QPushButton = ui.templateBtn
    template.clicked.connect(selectTemplate)

    # 选择MD来源目录
    source: QPushButton = ui.sourceBtn
    source.clicked.connect(selectSource)

    # 启动转换
    transform: QPushButton = ui.transformBtn
    transform.clicked.connect(convert)

    ui.show()

    sys.exit(app.exec())
