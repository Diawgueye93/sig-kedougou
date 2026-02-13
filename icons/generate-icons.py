#!/usr/bin/env python3
"""
Script pour générer les icônes PWA pour SIG Kédougou
Génère des icônes PNG à partir d'une image SVG de base
"""

import os
import base64
import struct
import zlib

def create_svg():
    """Créer une image SVG de base"""
    svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Fond -->
  <rect width="512" height="512" fill="#2c3e50" rx="20"/>
  
  <!-- Carte du monde stylisée -->
  <circle cx="256" cy="256" r="180" fill="#3498db" opacity="0.2"/>
  
  <!-- Marqueur de localisation -->
  <g transform="translate(256, 256)">
    <circle cx="0" cy="0" r="40" fill="#e74c3c" opacity="0.3"/>
    <circle cx="0" cy="0" r="30" fill="#e74c3c"/>
    <circle cx="0" cy="0" r="20" fill="#c0392b"/>
    <path d="M -8 -8 L 8 -8 L 0 12 Z" fill="white"/>
  </g>
  
  <!-- Géométrie de carte -->
  <g stroke="#3498db" stroke-width="3" fill="none" opacity="0.5">
    <path d="M 120 200 L 160 180 L 180 220"/>
    <path d="M 300 150 L 350 140 L 360 190"/>
    <path d="M 200 350 L 250 340 L 270 380"/>
  </g>
  
  <!-- Texte -->
  <text x="256" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
        text-anchor="middle" fill="white">SIG</text>
</svg>'''
    return svg

def create_png_from_svg(svg_string, width, height):
    """
    Créer une image PNG simple à partir d'une chaîne SVG
    Note: Pour une utilisation réelle, vous devriez utiliser PIL ou cairosvg
    """
    # Pour ce script, nous allons créer des fichiers PNG simples
    # Vous devez installer pillow: pip install pillow
    try:
        from PIL import Image, ImageDraw
        
        # Créer une image
        img = Image.new('RGB', (width, height), color=(44, 62, 80))  # #2c3e50
        draw = ImageDraw.Draw(img)
        
        # Dessiner un marqueur de localisation
        center_x, center_y = width // 2, height // 2
        
        # Cercle externe
        draw.ellipse([center_x - width//4, center_y - height//4, 
                     center_x + width//4, center_y + height//4], 
                    fill=(52, 152, 219), outline=(52, 152, 219))
        
        # Cercle interne rouge
        draw.ellipse([center_x - width//6, center_y - height//6, 
                     center_x + width//6, center_y + height//6], 
                    fill=(231, 76, 60), outline=(231, 76, 60))
        
        # Point blanc au centre
        draw.ellipse([center_x - width//12, center_y - height//12, 
                     center_x + width//12, center_y + height//12], 
                    fill=(255, 255, 255))
        
        # Pointer vers le bas
        pointer_size = width // 8
        points = [
            (center_x, center_y + width//4 + pointer_size),  # bas
            (center_x - pointer_size, center_y + width//4),  # gauche
            (center_x + pointer_size, center_y + width//4),  # droite
        ]
        draw.polygon(points, fill=(192, 57, 43))
        
        return img
        
    except ImportError:
        print("PIL non installé. Veuillez exécuter: pip install pillow")
        return None

def main():
    """Fonction principale"""
    print("Génération des icônes PWA...")
    
    try:
        from PIL import Image
        
        sizes = [72, 96, 128, 144, 152, 192, 384, 512]
        svg_string = create_svg()
        
        for size in sizes:
            print(f"Génération de l'icône {size}x{size}...")
            img = create_png_from_svg(svg_string, size, size)
            if img:
                filename = f"icon-{size}x{size}.png"
                img.save(filename)
                print(f"  ✓ {filename} créé")
            
            # Créer aussi une version maskable pour les icônes adaptatives
            if size in [192, 512]:
                filename = f"maskable-icon-{size}x{size}.png"
                img.save(filename)
                print(f"  ✓ {filename} créé")
        
        # Créer des captures d'écran
        print("\nGénération des captures d'écran...")
        for size, dimensions in [("1", (540, 720)), ("2", (1280, 720))]:
            img = Image.new('RGB', dimensions, color=(44, 62, 80))
            img.save(f"screenshot-{size}.png")
            print(f"  ✓ screenshot-{size}.png créé")
        
        print("\n✓ Toutes les icônes ont été générées avec succès!")
        
    except ImportError:
        print("⚠ Erreur: PIL (Pillow) n'est pas installé.")
        print("Veuillez exécuter: pip install pillow")
        print("\nAlternativement, déployez l'application et les fichiers PNG seront générés automatiquement.")

if __name__ == "__main__":
    main()
