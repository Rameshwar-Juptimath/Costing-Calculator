import cadquery as cq
from pathlib import Path

if __name__ == "__main__":
    cube = cq.Workplane("XY").box(10, 10, 10)
    assembly = cq.Assembly()
    assembly.add(cube, name="test_cube")
    output_path = Path(__file__).parent / "test_cube.step"
    assembly.save(str(output_path), exportType="STEP")
    print(f"Generated test_cube.step at {output_path}")
    print(f"Expected volume: 1000.0 mm³")
