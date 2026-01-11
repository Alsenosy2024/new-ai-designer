import sys

try:
    import bpy
    import addon_utils
except ImportError as exc:
    raise SystemExit("This script must be run inside Blender.") from exc


def main() -> None:
    argv = sys.argv
    if "--" not in argv:
        raise SystemExit("Usage: blender --background --python blender_export.py -- input.ifc output.gltf")
    args = argv[argv.index("--") + 1 :]
    if len(args) < 2:
        raise SystemExit("Expected input IFC and output glTF paths.")

    ifc_path, gltf_path = args[0], args[1]

    addon_utils.enable("blenderbim", default_set=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.ifc(filepath=ifc_path)
    bpy.ops.export_scene.gltf(filepath=gltf_path, export_format="GLTF_SEPARATE")


if __name__ == "__main__":
    main()
