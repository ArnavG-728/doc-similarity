import os
import fitz  # PyMuPDF
from docx import Document

def load_txt(file_path: str) -> str:
    """Load a plain text (.txt) file into a string."""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return ""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        print(f"❌ Unicode decode error in {file_path}, trying fallback encoding...")
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception as e:
            print(f"❌ Fallback decoding failed for {file_path}: {e}")
            return ""
    except Exception as e:
        print(f"❌ Error reading .txt file {file_path}: {e}")
        return ""

def load_pdf(file_path: str) -> str:
    """Load text from a PDF file using PyMuPDF."""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return ""
    try:
        text = ""
        with fitz.open(file_path) as doc:
            for i, page in enumerate(doc):
                page_text = page.get_text()
                if page_text:
                    text += page_text
        return text
    except Exception as e:
        print(f"❌ Error reading .pdf file {file_path}: {e}")
        return ""

def load_docx(file_path: str) -> str:
    """Load text from a Microsoft Word .docx file."""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return ""
    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except Exception as e:
        print(f"❌ Error reading .docx file {file_path}: {e}")
        return ""

def load_document(file_path: str) -> str:
    """Dispatches to the appropriate file loader based on extension."""
    ext = os.path.splitext(file_path)[1].lower()
    print(f"📂 Loading file: {file_path}")
    
    if ext == ".txt":
        return load_txt(file_path)
    elif ext == ".pdf":
        return load_pdf(file_path)
    elif ext == ".docx":
        return load_docx(file_path)
    else:
        print(f"⚠️ Unsupported file format: {file_path}")
        return ""

def load_documents_from_folder(folder_path: str) -> dict:
    """Load all supported documents from a given folder."""
    supported_exts = {".txt", ".pdf", ".docx"}
    documents = {}

    if not os.path.isdir(folder_path):
        print(f"❌ Directory not found: {folder_path}")
        return documents

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if not os.path.isfile(file_path):
            continue

        ext = os.path.splitext(filename)[1].lower()
        if ext in supported_exts:
            content = load_document(file_path)
            if content:
                documents[filename] = content
            else:
                print(f"⚠️ No readable content in: {filename}")
        else:
            print(f"⚠️ Skipped unsupported file: {filename}")
    return documents
