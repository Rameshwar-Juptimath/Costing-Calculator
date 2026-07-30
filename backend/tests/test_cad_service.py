import pytest
from pathlib import Path
from app.services.cad_service import _process_step_sync
import tempfile

TEST_CUBE_PATH = str(Path(__file__).parent / "test_cube.step")

@pytest.mark.skipif(not Path(TEST_CUBE_PATH).exists(), reason="test_cube.step not generated yet")
def test_step_volume_extraction():
    with tempfile.TemporaryDirectory() as tmpdir:
        result = _process_step_sync(TEST_CUBE_PATH, tmpdir)
        assert abs(result["geometry"]["volume_mm3"] - 1000.0) < 0.1
        assert result["geometry"]["bounding_box"]["x_mm"] == pytest.approx(10.0, abs=0.1)
        assert result["geometry"]["bounding_box"]["y_mm"] == pytest.approx(10.0, abs=0.1)
        assert result["geometry"]["bounding_box"]["z_mm"] == pytest.approx(10.0, abs=0.1)

def test_step_glb_exported():
    with tempfile.TemporaryDirectory() as tmpdir:
        result = _process_step_sync(TEST_CUBE_PATH, tmpdir)
        assert Path(result["glb_path"]).exists()
