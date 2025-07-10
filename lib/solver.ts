// Transportation problem solver using a simplified approach

interface Allocation {
  source: number
  destination: number
  quantity: number
  roadCondition: string
  trips: number
}

interface Route {
  source: number
  destination: number
  cost: number
  roadCondition: string
}

interface Solution {
  allocation: Allocation[]
  totalCost: number
  totalTrips: number
  poorRoadCount: number
  poorRoadImpact: number
  mostEfficientRoute: Route
  leastEfficientRoute: Route
  avgTripsPerRoute: number
  roadImprovementPriority: Route
}

export function solveTransportationProblem(
  supply: number[],
  demand: number[],
  costMatrix: number[][],
  roadConditions: string[][],
  truckCapacity: number,
): Solution {
  // Check if the problem is balanced
  const totalSupply = supply.reduce((sum, s) => sum + s, 0)
  const totalDemand = demand.reduce((sum, d) => sum + d, 0)

  if (totalSupply < totalDemand) {
    throw new Error("Total supply is less than total demand. The problem is infeasible.")
  }

  // Clone arrays to avoid modifying originals
  const remainingSupply = [...supply]
  const remainingDemand = [...demand]

  const allocation: Allocation[] = []

  // Simple implementation of Northwest Corner method
  // In a real system, we would use more sophisticated algorithms like:
  // - Vogel's Approximation Method
  // - Modified Distribution Method
  // - Hungarian Algorithm for assignment problems

  // For demonstration, using a greedy approach with road conditions consideration
  const routes: Route[] = []

  // Create all possible routes with their costs
  for (let i = 0; i < supply.length; i++) {
    for (let j = 0; j < demand.length; j++) {
      // Adjust cost based on road conditions
      let adjustedCost = costMatrix[i][j]
      if (roadConditions[i][j].toLowerCase() === "poor") {
        // Poor roads increase cost by 30%
        adjustedCost *= 1.3
      }

      routes.push({
        source: i,
        destination: j,
        cost: adjustedCost,
        roadCondition: roadConditions[i][j],
      })
    }
  }

  // Sort routes by cost (greedy approach)
  routes.sort((a, b) => a.cost - b.cost)

  // Allocate based on sorted routes
  for (const route of routes) {
    const { source, destination } = route

    if (remainingSupply[source] > 0 && remainingDemand[destination] > 0) {
      const quantity = Math.min(remainingSupply[source], remainingDemand[destination])

      // Calculate number of trips needed based on truck capacity
      let trips = Math.ceil(quantity / truckCapacity)

      // Poor roads may require more trips due to reduced load
      if (route.roadCondition.toLowerCase() === "poor") {
        // On poor roads, trucks can only carry 80% of capacity
        trips = Math.ceil(quantity / (truckCapacity * 0.8))
      }

      allocation.push({
        source,
        destination,
        quantity,
        roadCondition: route.roadCondition,
        trips,
      })

      remainingSupply[source] -= quantity
      remainingDemand[destination] -= quantity
    }
  }

  // Calculate total cost and trips
  let totalCost = 0
  let totalTrips = 0
  let poorRoadCount = 0

  for (const alloc of allocation) {
    const { source, destination, quantity, roadCondition, trips } = alloc
    totalCost += costMatrix[source][destination] * quantity
    totalTrips += trips

    if (roadCondition.toLowerCase() === "poor") {
      poorRoadCount++
    }
  }

  // Find most and least efficient routes
  const routeEfficiency = allocation.map((alloc) => {
    const { source, destination, quantity, trips } = alloc
    return {
      source,
      destination,
      cost: costMatrix[source][destination],
      efficiency: quantity / trips,
      roadCondition: alloc.roadCondition,
    }
  })

  routeEfficiency.sort((a, b) => b.efficiency - a.efficiency)

  const mostEfficientRoute = routeEfficiency.length > 0 ? routeEfficiency[0] : routes[0]
  const leastEfficientRoute =
    routeEfficiency.length > 0 ? routeEfficiency[routeEfficiency.length - 1] : routes[routes.length - 1]

  // Calculate average trips per route
  const avgTripsPerRoute = totalTrips / allocation.length

  // Determine road improvement priority (poor road with highest volume)
  const poorRoads = allocation
    .filter((a) => a.roadCondition.toLowerCase() === "poor")
    .sort((a, b) => b.quantity - a.quantity)

  const roadImprovementPriority =
    poorRoads.length > 0
      ? { source: poorRoads[0].source, destination: poorRoads[0].destination, cost: 0, roadCondition: "poor" }
      : { source: 0, destination: 0, cost: 0, roadCondition: "good" }

  return {
    allocation,
    totalCost,
    totalTrips,
    poorRoadCount,
    poorRoadImpact: 30, // Assuming 30% impact from poor roads
    mostEfficientRoute,
    leastEfficientRoute,
    avgTripsPerRoute,
    roadImprovementPriority,
  }
}
