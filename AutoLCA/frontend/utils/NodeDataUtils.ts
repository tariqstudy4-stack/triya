export interface Flow {
  id: string;
  name: string;
  amount: number;
  unit: string;
  type: "nature" | "technosphere" | "product" | "emission";
}

export interface NodeDataParams {
  id: string;
  name: string;
  category: string;
  uuid: string;
  inputs: Flow[];
  outputs: Flow[];
  controls?: Flow[];
  mechanisms?: Flow[];
}

export const getMockParametersByCategory = (category: string, name: string): Partial<NodeDataParams> => {
  const baseId = `param-${Math.random().toString(36).substr(2, 9)}`;

  switch (category) {
    case "Energy":
      return {
        inputs: [
          { id: `${baseId}-i1`, name: "Natural Gas", amount: 10, unit: "MJ", type: "nature" },
          { id: `${baseId}-i2`, name: "Coal, hard", amount: 5, unit: "kg", type: "nature" }
        ],
        outputs: [
          { id: `${baseId}-o1`, name: "Electricity, low voltage", amount: 1, unit: "kWh", type: "product" },
          { id: `${baseId}-o2`, name: "Carbon Dioxide (CO2)", amount: 0.85, unit: "kg", type: "emission" }
        ],
        controls: [
          { id: `${baseId}-c1`, name: "Grid Frequency Control", amount: 1, unit: "Hz", type: "technosphere" }
        ],
        mechanisms: [
          { id: `${baseId}-m1`, name: "Turbine Generator", amount: 1, unit: "unit", type: "technosphere" }
        ]
      };
    case "Transport":
      return {
        inputs: [
          { id: `${baseId}-i1`, name: "Diesel fuel", amount: 0.1, unit: "kg", type: "technosphere" },
          { id: `${baseId}-i2`, name: "Transport services, lorry", amount: 1, unit: "t*km", type: "technosphere" }
        ],
        outputs: [
          { id: `${baseId}-o1`, name: "Transport service", amount: 1, unit: "unit", type: "product" },
          { id: `${baseId}-o2`, name: "Particulates < 2.5um", amount: 0.002, unit: "kg", type: "emission" }
        ]
      };
    case "Materials":
      return {
        inputs: [
          { id: `${baseId}-i1`, name: "Virgin Polyethylene", amount: 1, unit: "kg", type: "technosphere" },
          { id: `${baseId}-i2`, name: "Electricity, grid mix", amount: 0.5, unit: "kWh", type: "technosphere" }
        ],
        outputs: [
          { id: `${baseId}-o1`, name: "Granulated PE Material", amount: 0.98, unit: "kg", type: "product" },
          { id: `${baseId}-o2`, name: "Waste Polyethylene", amount: 0.02, unit: "kg", type: "emission" }
        ]
      };
    default:
      return {
        inputs: [
          { id: `${baseId}-i1`, name: "Generic Resource", amount: 1, unit: "kg", type: "nature" }
        ],
        outputs: [
          { id: `${baseId}-o1`, name: "Generic Product", amount: 1, unit: "unit", type: "product" }
        ]
      };
  }
};
