#!/usr/bin/env python3

import PyPDF2
import sys

def extract_pdf_to_text():
    pdf_path = '/Users/abdulmajeed/Downloads/giki-bot/Undergraduate-Admissions-Policy.pdf'
    output_path = '/Users/abdulmajeed/Downloads/giki-bot/pdf-content.txt'
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            # Write to text file
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(text)
            
            print(f"Successfully extracted {len(text)} characters to {output_path}")
            return True
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    extract_pdf_to_text()
