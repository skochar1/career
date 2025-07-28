#!/usr/bin/env python3
"""
PDF parsing service for resume text extraction.
Uses PyPDF2 for reliable PDF text extraction.
"""

import sys
import json
import logging
from pathlib import Path
import io

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Installing now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "PyPDF2"])
    import PyPDF2

def extract_text_from_pdf(pdf_data):
    """
    Extract text from PDF data using PyPDF2.
    
    Args:
        pdf_data: PDF file data as bytes
        
    Returns:
        dict: {'success': bool, 'text': str, 'error': str}
    """
    try:
        # Create a PDF reader from memory buffer
        pdf_buffer = io.BytesIO(pdf_data)
        pdf_reader = PyPDF2.PdfReader(pdf_buffer)
        
        extracted_text = ""
        page_count = len(pdf_reader.pages)
        
        # Extract text from each page
        for page_num in range(page_count):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            extracted_text += page_text + "\n"
        
        # Clean up the text
        extracted_text = extracted_text.strip()
        
        if len(extracted_text) < 10:
            return {
                'success': False,
                'text': '',
                'error': 'Extracted text is too short or empty'
            }
        
        return {
            'success': True,
            'text': extracted_text,
            'error': None,
            'pages': page_count,
            'char_count': len(extracted_text)
        }
        
    except Exception as e:
        return {
            'success': False,
            'text': '',
            'error': str(e)
        }

def main():
    """
    Main function for command line usage.
    Can accept PDF path as argument or PDF data from stdin.
    """
    try:
        if len(sys.argv) > 1:
            # Read from file path
            pdf_path = sys.argv[1]
            with open(pdf_path, 'rb') as f:
                pdf_data = f.read()
        else:
            # Read PDF data from stdin
            pdf_data = sys.stdin.buffer.read()
        
        if not pdf_data:
            result = {
                'success': False,
                'text': '',
                'error': 'No PDF data received'
            }
        else:
            result = extract_text_from_pdf(pdf_data)
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'success': False,
            'text': '',
            'error': f"Script error: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()