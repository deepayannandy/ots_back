const mongoos = require("mongoose");

const reactorSchema = new mongoos.Schema(
  {
    config: {
      totalPieSlice: {
        type: Number,
        required: false,
      },
      shape: {
        type: String,
        required: true,
        enum: ["CIRCLE", "RECTANGLE", "HEXAGONE", "DONUT"],
      },
      outerDimension: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: false,
      },
      width: {
        type: Number,
        required: false,
      },
      innerRadius: {
        type: Number,
        required: false,
      },
      tubeRadius: {
        type: Number,
        required: true,
      },
      padding: {
        type: Number,
        required: true,
      },
      shapeColor: {
        type: String,
        required: true,
      },
      paddingColor: {
        type: String,
        required: true,
      },
      pitch: {
        type: Number,
        required: true,
      },
      lattice: {
        type: String,
        required: true,
        enum: ["triangular", "rectangular", "square"],
      },
      angle: {
        type: Number,
        required: true,
        enum: [30, 45, 60, 90],
      },
      positions: {
        scale: { type: Number, required: false },
        tx: { type: Number, required: false },
        ty: { type: Number, required: false },
        rotation: { type: Number, required: false },
      },
    },
    tubes: [
      {
        id: {
          type: String,
          required: true,
        },
        x: {
          type: Number,
          required: true,
        },
        y: {
          type: Number,
          required: true,
        },
        r: {
          type: Number,
          required: true,
        },
        deleted: {
          type: Boolean,
          required: true,
          default: false,
        },
        property: {
          type: String,
          required: false,
        },
        propertyColor: {
          type: String,
          required: false,
        },
        pieSlice: {
          type: Number,
          require: false,
        },
        comment: {
          type: String,
          required: false,
        },
      },
    ],
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoos.model("reactor", reactorSchema);
