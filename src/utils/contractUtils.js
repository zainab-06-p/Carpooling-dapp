export const callContractMethod = async (contract, methodName, args, options = {}) => {
  try {
    const stringArgs = args.map(arg => typeof arg === 'number' ? arg.toString() : arg);
    const gasEstimate = await contract.methods[methodName](...stringArgs).estimateGas(options);
    return await contract.methods[methodName](...stringArgs).send({
      ...options,
      gas: Math.floor(gasEstimate * 1.5)
    });
  } catch (error) {
    console.error(`Contract Error (${methodName}):`, error);
    throw error;
  }
};

export const ensureNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) throw new Error(`Invalid number: ${value}`);
  return num;
};

export const findEntity = (entities, id) => {
  const numericId = ensureNumber(id);
  const entity = entities.find(e => Number(e.id) === numericId);
  if (!entity) throw new Error("Entity not found");
  return entity;
};