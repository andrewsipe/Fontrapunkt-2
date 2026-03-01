#!/usr/bin/env python3
"""
FontTools wrapper for generating static font instances
"""

import sys
import json
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

def instantiate_variable_font(input_path, output_path, axis_values):
    """Generate a static instance from a variable font"""
    try:
        font = TTFont(input_path)
        
        # Convert axis values to proper format
        axis_dict = {}
        for tag, value in axis_values.items():
            axis_dict[tag] = float(value)
        
        # Instantiate the font
        instancer.instantiateVariableFont(font, axis_dict)
        
        # Save the instance
        font.save(output_path)
        return True
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 fonttools-wrapper.py <input> <output> <axis_values_json>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    axis_values_json = sys.argv[3]
    
    try:
        axis_values = json.loads(axis_values_json)
    except json.JSONDecodeError:
        print("Error: Invalid JSON for axis values", file=sys.stderr)
        sys.exit(1)
    
    success = instantiate_variable_font(input_path, output_path, axis_values)
    sys.exit(0 if success else 1)

