//Default values
    export async function DefaultValues(): Promise<string> {
    let solutionprefix = process.env.solutionprefix;
    let optionsValues = process.env.optionsValues;
    let convertedValue: number | null = optionsValues ? parseInt(optionsValues, 10) : null;
    if (!solutionprefix) {
      solutionprefix = "new_";
    }
    if (!convertedValue) {
      convertedValue = 80000000;
    }
    return `Set default  prefix for all schema names:${solutionprefix} in the case of create and update entity and attribute. for example ${solutionprefix}name ,${solutionprefix}age etc..In case of picklist, multiselectpicklist, and boolean data types, each option is assigned a unique sequential number. When assigning values to options, the first option should have the value ${optionsValues}.For the second option, assign the value that corresponds to the next step in the sequence,ensuring that each subsequent option is given a value in increasing order. Please follow this pattern consistently for all options to maintain clarity and proper sequencing.`;
  }
