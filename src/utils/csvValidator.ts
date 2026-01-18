/**
 * CSV Import Validator
 * Validates CSV data before importing into the system
 */

export interface CSVRow {
  [key: string]: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validRows: CSVRow[];
  invalidRows: CSVRow[];
}

/**
 * Required columns for inventory CSV import
 */
export const REQUIRED_COLUMNS = [
  "name",
  "partNumber",
  "category",
  "vehicleType",
  "quantity",
  "price",
  "mrp",
];

/**
 * Optional columns for inventory CSV import
 */
export const OPTIONAL_COLUMNS = [
  "sku",
  "brand",
  "supplier",
  "partyName",
  "hsnCode",
  "location",
  "minStockLevel",
  "retailPrice",
  "wholesalePrice",
  "distributorPrice",
  "barcode",
  "warrantyPeriod",
  "bikeName",
  "bikeModel",
  "bikeType",
  "description",
];

/**
 * Valid category values
 */
export const VALID_CATEGORIES = ["local", "original", "branded"];

/**
 * Valid vehicle type values
 */
export const VALID_VEHICLE_TYPES = [
  "two_wheeler",
  "2w",
  "four_wheeler",
  "4w",
  "two wheeler",
  "four wheeler",
];

/**
 * Validate a single CSV row
 */
export const validateRow = (
  row: CSVRow,
  rowNumber: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check required fields
  REQUIRED_COLUMNS.forEach((column) => {
    if (!row[column] || row[column].trim() === "") {
      errors.push({
        row: rowNumber,
        field: column,
        value: row[column] || "",
        message: `Required field "${column}" is missing or empty`,
      });
    }
  });

  // Validate category
  if (row.category) {
    const category = row.category.toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push({
        row: rowNumber,
        field: "category",
        value: row.category,
        message: `Invalid category "${
          row.category
        }". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }
  }

  // Validate vehicle type
  if (row.vehicleType) {
    const vehicleType = row.vehicleType.toLowerCase().trim();
    if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
      errors.push({
        row: rowNumber,
        field: "vehicleType",
        value: row.vehicleType,
        message: `Invalid vehicle type "${
          row.vehicleType
        }". Must be one of: ${VALID_VEHICLE_TYPES.join(", ")}`,
      });
    }
  }

  // Validate quantity (must be a number)
  if (row.quantity) {
    const quantity = parseFloat(row.quantity);
    if (isNaN(quantity) || quantity < 0) {
      errors.push({
        row: rowNumber,
        field: "quantity",
        value: row.quantity,
        message: `Invalid quantity "${row.quantity}". Must be a positive number`,
      });
    }
  }

  // Validate price (must be a number)
  if (row.price) {
    const price = parseFloat(row.price);
    if (isNaN(price) || price < 0) {
      errors.push({
        row: rowNumber,
        field: "price",
        value: row.price,
        message: `Invalid price "${row.price}". Must be a positive number`,
      });
    }
  }

  // Validate MRP (must be a number)
  if (row.mrp) {
    const mrp = parseFloat(row.mrp);
    if (isNaN(mrp) || mrp < 0) {
      errors.push({
        row: rowNumber,
        field: "mrp",
        value: row.mrp,
        message: `Invalid MRP "${row.mrp}". Must be a positive number`,
      });
    }
  }

  // Validate minStockLevel (if provided, must be a number)
  if (row.minStockLevel) {
    const minStock = parseFloat(row.minStockLevel);
    if (isNaN(minStock) || minStock < 0) {
      errors.push({
        row: rowNumber,
        field: "minStockLevel",
        value: row.minStockLevel,
        message: `Invalid min stock level "${row.minStockLevel}". Must be a positive number`,
      });
    }
  }

  return errors;
};

/**
 * Validate entire CSV dataset
 */
export const validateCSV = (rows: CSVRow[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const validRows: CSVRow[] = [];
  const invalidRows: CSVRow[] = [];

  // Check if CSV has required columns
  if (rows.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          row: 0,
          field: "CSV",
          value: "",
          message: "CSV file is empty",
        },
      ],
      validRows: [],
      invalidRows: [],
    };
  }

  // Check for required columns in header
  const headers = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col)
  );

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      errors: [
        {
          row: 0,
          field: "Headers",
          value: headers.join(", "),
          message: `Missing required columns: ${missingColumns.join(", ")}`,
        },
      ],
      validRows: [],
      invalidRows: [],
    };
  }

  // Validate each row
  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because row 1 is header, and we're 0-indexed
    const rowErrors = validateRow(row, rowNumber);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      invalidRows.push(row);
    } else {
      validRows.push(row);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validRows,
    invalidRows,
  };
};

/**
 * Normalize category value
 */
export const normalizeCategory = (category: string): string => {
  const normalized = category.toLowerCase().trim();

  // Map variations to standard values
  if (normalized === "local" || normalized === "branded") {
    return "local";
  } else if (
    normalized === "original" ||
    normalized === "genuine" ||
    normalized === "oem"
  ) {
    return "original";
  }

  return "local"; // Default to local
};

/**
 * Normalize vehicle type value
 */
export const normalizeVehicleType = (vehicleType: string): string => {
  const normalized = vehicleType.toLowerCase().trim();

  // Map variations to standard values
  if (
    normalized === "2w" ||
    normalized === "two_wheeler" ||
    normalized === "two wheeler" ||
    normalized === "bike" ||
    normalized === "motorcycle"
  ) {
    return "two_wheeler";
  } else if (
    normalized === "4w" ||
    normalized === "four_wheeler" ||
    normalized === "four wheeler" ||
    normalized === "car"
  ) {
    return "four_wheeler";
  }

  return "two_wheeler"; // Default to two wheeler
};

/**
 * Check for duplicate SKUs/Part Numbers
 */
export const checkDuplicates = (
  rows: CSVRow[],
  existingPartNumbers: string[]
): { duplicates: string[]; upserts: string[] } => {
  const duplicates: string[] = [];
  const upserts: string[] = [];
  const seenInCSV = new Set<string>();

  rows.forEach((row) => {
    const partNumber = row.partNumber || row.sku || "";

    if (partNumber) {
      // Check if already seen in this CSV
      if (seenInCSV.has(partNumber)) {
        duplicates.push(partNumber);
      } else {
        seenInCSV.add(partNumber);

        // Check if exists in database (will be upserted)
        if (existingPartNumbers.includes(partNumber)) {
          upserts.push(partNumber);
        }
      }
    }
  });

  return { duplicates, upserts };
};

/**
 * Generate validation report
 */
export const generateValidationReport = (result: ValidationResult): string => {
  let report = "═══════════════════════════════════════\n";
  report += "     CSV VALIDATION REPORT\n";
  report += "═══════════════════════════════════════\n\n";

  report += `Total Rows: ${
    result.validRows.length + result.invalidRows.length
  }\n`;
  report += `Valid Rows: ${result.validRows.length} ✅\n`;
  report += `Invalid Rows: ${result.invalidRows.length} ❌\n`;
  report += `Total Errors: ${result.errors.length}\n\n`;

  if (result.errors.length > 0) {
    report += "───────────────────────────────────────\n";
    report += "ERRORS FOUND:\n";
    report += "───────────────────────────────────────\n\n";

    result.errors.forEach((error, index) => {
      report += `${index + 1}. Row ${error.row} - ${error.field}\n`;
      report += `   Value: "${error.value}"\n`;
      report += `   Error: ${error.message}\n\n`;
    });
  }

  if (result.isValid) {
    report += "✅ All rows passed validation!\n";
    report += "Ready to import.\n";
  } else {
    report += "❌ Validation failed!\n";
    report += "Please fix the errors above before importing.\n";
  }

  report += "\n═══════════════════════════════════════\n";

  return report;
};

/**
 * Sample CSV template generator
 */
export const generateSampleCSV = (): string => {
  const headers = [
    ...REQUIRED_COLUMNS,
    ...OPTIONAL_COLUMNS.slice(0, 5), // Include some optional columns
  ];

  const sampleRows = [
    {
      name: "Engine Oil - Castrol 20W-50",
      partNumber: "CTL-20W50-1L",
      category: "local",
      vehicleType: "four_wheeler",
      quantity: "45",
      price: "850",
      mrp: "950",
      sku: "SKU001",
      brand: "Castrol",
      supplier: "Pokhara Auto Parts",
      hsnCode: "27101990",
      location: "Shelf A-12",
    },
    {
      name: "Brake Pads - NGK",
      partNumber: "NGK-BP-2W",
      category: "original",
      vehicleType: "two_wheeler",
      quantity: "120",
      price: "350",
      mrp: "450",
      sku: "SKU002",
      brand: "NGK",
      supplier: "Pokhara Spare Parts",
      hsnCode: "87083010",
      location: "Shelf B-05",
    },
  ];

  // Generate CSV string
  let csv = headers.join(",") + "\n";
  sampleRows.forEach((row) => {
    const values = headers.map((header) => {
      const value = (row as any)[header] || "";
      // Escape commas and quotes
      return value.includes(",") ? `"${value}"` : value;
    });
    csv += values.join(",") + "\n";
  });

  return csv;
};

export default {
  validateRow,
  validateCSV,
  normalizeCategory,
  normalizeVehicleType,
  checkDuplicates,
  generateValidationReport,
  generateSampleCSV,
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  VALID_CATEGORIES,
  VALID_VEHICLE_TYPES,
};
