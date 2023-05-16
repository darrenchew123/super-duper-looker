project_name: "viz-histogram-marketplace"

constant: VIS_LABEL {
  value: "test_darren_custom"
  export: override_optional
}

constant: VIS_ID {
  value: "custom_viz"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  file: "custom_attrition.js"
  label: "@{VIS_LABEL}"
}
