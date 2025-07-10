interface RealWorldFactors {
  fuelCostPerLiter: number
  driverWagePerHour: number
  maintenanceCostPerKm: number
  spoilageRate: number
  weatherCondition: string
  trafficMultiplier: number
  seasonalDemandMultiplier: number
  storageCapacity: number[]
  storageCostPerLiter: number
  deliveryTimeWindow: number
  vehicleBreakdownProbability: number
  fuelEfficiencyGoodRoad: number
  fuelEfficiencyPoorRoad: number
}

interface Allocation {
  source: number
  destination: number
  quantity: number
  distance: number
  roadCondition: string
  trips: number
  routeCost: number
  fuelCost: number
  laborCost: number
  maintenanceCost: number
}

interface Solution {
  allocation: Allocation[]
  totalCost: number
  totalDistance: number
  totalTrips: number
  costBreakdown: {
    transportation: number
    fuel: number
    labor: number
    maintenance: number
    storage: number
    spoilage: number
  }
  poorRoadRoutes: number
  additionalFuelCost: number
  additionalDeliveryTime: number
  efficiencyReduction: number
  recommendations: string[]
}

export function solveAdvancedTransportationProblem(
  supply: number[],
  demand: number[],
  costMatrix: number[][],
  distanceMatrix: number[][],
  roadConditions: string[][],
  truckCapacity: number,
  factors: RealWorldFactors,
): Solution {
  // Check feasibility
  const totalSupply = supply.reduce((sum, s) => sum + s, 0)
  const totalDemand = demand.reduce((sum, d) => sum + d, 0)

  if (totalSupply < totalDemand) {
    throw new Error("Total supply is less than total demand. Problem is infeasible.")
  }

  // Apply seasonal demand multiplier
  const adjustedDemand = demand.map((d) => Math.round(d * factors.seasonalDemandMultiplier))

  // Clone arrays for processing
  const remainingSupply = [...supply]
  const remainingDemand = [...adjustedDemand]

  const allocation: Allocation[] = []

  // Create route efficiency matrix considering all factors
  const routes: Array<{
    source: number
    destination: number
    cost: number
    distance: number
    roadCondition: string
    efficiency: number
  }> = []

  for (let i = 0; i < supply.length; i++) {
    for (let j = 0; j < demand.length; j++) {
      const distance = distanceMatrix[i][j]
      const roadCondition = roadConditions[i][j]
      const baseCost = costMatrix[i][j]

      // Calculate fuel efficiency based on road condition
      let fuelEfficiency = factors.fuelEfficiencyGoodRoad
      let roadMultiplier = 1.0

      switch (roadCondition.toLowerCase()) {
        case "excellent":
          fuelEfficiency = factors.fuelEfficiencyGoodRoad * 1.1
          roadMultiplier = 0.9
          break
        case "good":
          fuelEfficiency = factors.fuelEfficiencyGoodRoad
          roadMultiplier = 1.0
          break
        case "fair":
          fuelEfficiency = factors.fuelEfficiencyGoodRoad * 0.9
          roadMultiplier = 1.2
          break
        case "poor":
          fuelEfficiency = factors.fuelEfficiencyPoorRoad
          roadMultiplier = 1.5
          break
        case "very-poor":
          fuelEfficiency = factors.fuelEfficiencyPoorRoad * 0.8
          roadMultiplier = 2.0
          break
      }

      // Apply weather conditions
      switch (factors.weatherCondition.toLowerCase()) {
        case "rainy":
          fuelEfficiency *= 0.9
          roadMultiplier *= 1.2
          break
        case "stormy":
          fuelEfficiency *= 0.8
          roadMultiplier *= 1.5
          break
      }

      // Apply traffic multiplier
      roadMultiplier *= factors.trafficMultiplier

      // Calculate total route cost including all factors
      const fuelCostPerTrip = (distance / fuelEfficiency) * factors.fuelCostPerLiter
      const laborCostPerTrip = (distance / 50) * factors.driverWagePerHour * roadMultiplier // Assuming 50 km/h average speed
      const maintenanceCostPerTrip = distance * factors.maintenanceCostPerKm

      const totalCostPerLiter = baseCost + (fuelCostPerTrip + laborCostPerTrip + maintenanceCostPerTrip) / truckCapacity

      routes.push({
        source: i,
        destination: j,
        cost: totalCostPerLiter,
        distance,
        roadCondition,
        efficiency: 1 / (totalCostPerLiter * roadMultiplier),
      })
    }
  }

  // Sort routes by efficiency (cost-effectiveness)
  routes.sort((a, b) => b.efficiency - a.efficiency)

  // Allocate using greedy approach based on efficiency
  for (const route of routes) {
    const { source, destination, distance, roadCondition } = route

    if (remainingSupply[source] > 0 && remainingDemand[destination] > 0) {
      const quantity = Math.min(remainingSupply[source], remainingDemand[destination])

      // Calculate effective truck capacity based on road conditions
      let effectiveCapacity = truckCapacity
      if (roadCondition.toLowerCase() === "poor" || roadCondition.toLowerCase() === "very-poor") {
        effectiveCapacity *= 0.8 // Reduced capacity on poor roads
      }

      // Account for spoilage
      const effectiveQuantity = quantity * (1 - factors.spoilageRate / 100)
      const trips = Math.ceil(quantity / effectiveCapacity)

      // Calculate detailed costs in Rupees
      const fuelEfficiency = roadCondition.toLowerCase().includes("poor")
        ? factors.fuelEfficiencyPoorRoad
        : factors.fuelEfficiencyGoodRoad

      const fuelCost = trips * (distance / fuelEfficiency) * factors.fuelCostPerLiter
      const laborCost = trips * (distance / 50) * factors.driverWagePerHour
      const maintenanceCost = trips * distance * factors.maintenanceCostPerKm
      const routeCost = quantity * costMatrix[source][destination] + fuelCost + laborCost + maintenanceCost

      allocation.push({
        source,
        destination,
        quantity,
        distance,
        roadCondition,
        trips,
        routeCost,
        fuelCost,
        laborCost,
        maintenanceCost,
      })

      remainingSupply[source] -= quantity
      remainingDemand[destination] -= quantity
    }
  }

  // Calculate totals and analysis
  const totalCost = allocation.reduce((sum, alloc) => sum + alloc.routeCost, 0)
  const totalDistance = allocation.reduce((sum, alloc) => sum + alloc.distance * alloc.trips, 0)
  const totalTrips = allocation.reduce((sum, alloc) => sum + alloc.trips, 0)

  const costBreakdown = {
    transportation: allocation.reduce(
      (sum, alloc) => sum + alloc.quantity * costMatrix[alloc.source][alloc.destination],
      0,
    ),
    fuel: allocation.reduce((sum, alloc) => sum + alloc.fuelCost, 0),
    labor: allocation.reduce((sum, alloc) => sum + alloc.laborCost, 0),
    maintenance: allocation.reduce((sum, alloc) => sum + alloc.maintenanceCost, 0),
    storage: supply.reduce((sum, s, i) => sum + s * factors.storageCostPerLiter, 0),
    spoilage: totalCost * (factors.spoilageRate / 100),
  }

  // Analyze poor road impact
  const poorRoadRoutes = allocation.filter((alloc) => alloc.roadCondition.toLowerCase().includes("poor")).length

  const goodRoadBaseline = allocation.reduce((sum, alloc) => {
    const baselineFuel = alloc.trips * (alloc.distance / factors.fuelEfficiencyGoodRoad) * factors.fuelCostPerLiter
    return sum + baselineFuel
  }, 0)

  const additionalFuelCost = costBreakdown.fuel - goodRoadBaseline
  const additionalDeliveryTime =
    allocation.reduce((sum, alloc) => {
      if (alloc.roadCondition.toLowerCase().includes("poor")) {
        return sum + alloc.trips * (alloc.distance / 30) // Reduced speed on poor roads
      }
      return sum + alloc.trips * (alloc.distance / 50)
    }, 0) - allocation.reduce((sum, alloc) => sum + alloc.trips * (alloc.distance / 50), 0)

  const efficiencyReduction = (additionalFuelCost / goodRoadBaseline) * 100

  // Generate recommendations
  const recommendations: string[] = []

  if (poorRoadRoutes > 0) {
    recommendations.push(`Prioritize road improvements for ${poorRoadRoutes} routes with poor conditions`)
  }

  if (factors.spoilageRate > 3) {
    recommendations.push("Consider refrigerated trucks to reduce spoilage rate")
  }

  if (totalTrips > supply.length * 3) {
    recommendations.push("Consider increasing truck capacity or adding more vehicles")
  }

  const avgUtilization = allocation.reduce((sum, alloc) => sum + alloc.quantity, 0) / (truckCapacity * totalTrips)
  if (avgUtilization < 0.7) {
    recommendations.push("Optimize route consolidation to improve truck utilization")
  }

  recommendations.push("Implement GPS tracking for real-time route optimization")
  recommendations.push("Consider establishing intermediate distribution hubs")

  return {
    allocation,
    totalCost: totalCost + costBreakdown.storage + costBreakdown.spoilage,
    totalDistance,
    totalTrips,
    costBreakdown,
    poorRoadRoutes,
    additionalFuelCost,
    additionalDeliveryTime,
    efficiencyReduction,
    recommendations,
  }
}
