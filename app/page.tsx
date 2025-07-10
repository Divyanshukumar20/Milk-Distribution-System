"use client"

import { useState, useEffect } from "react"
import { solveAdvancedTransportationProblem } from "@/lib/advanced-solver"

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

export default function Home() {
  const [activeTab, setActiveTab] = useState("setup")
  const [numSources, setNumSources] = useState<number>(2)
  const [numDestinations, setNumDestinations] = useState<number>(3)

  // Dynamic arrays for inputs
  const [supplies, setSupplies] = useState<number[]>([1000, 1500])
  const [demands, setDemands] = useState<number[]>([800, 700, 1000])
  const [costMatrix, setCostMatrix] = useState<number[][]>([
    [10, 12, 8],
    [13, 9, 14],
  ])
  const [distanceMatrix, setDistanceMatrix] = useState<number[][]>([
    [50, 60, 40],
    [65, 45, 70],
  ])
  const [roadConditions, setRoadConditions] = useState<string[][]>([
    ["good", "poor", "good"],
    ["poor", "good", "poor"],
  ])
  const [truckCapacity, setTruckCapacity] = useState<number>(500)

  // Real-world factors
  const [realWorldFactors, setRealWorldFactors] = useState<RealWorldFactors>({
    fuelCostPerLiter: 1.5,
    driverWagePerHour: 15,
    maintenanceCostPerKm: 0.5,
    spoilageRate: 2,
    weatherCondition: "normal",
    trafficMultiplier: 1.0,
    seasonalDemandMultiplier: 1.0,
    storageCapacity: [2000, 2500],
    storageCostPerLiter: 0.1,
    deliveryTimeWindow: 8,
    vehicleBreakdownProbability: 0.05,
    fuelEfficiencyGoodRoad: 8,
    fuelEfficiencyPoorRoad: 12,
  })

  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>("")

  // Update arrays when number of sources/destinations changes
  useEffect(() => {
    // Adjust supplies array
    const newSupplies = [...supplies]
    while (newSupplies.length < numSources) {
      newSupplies.push(1000)
    }
    while (newSupplies.length > numSources) {
      newSupplies.pop()
    }
    setSupplies(newSupplies)

    // Adjust storage capacity
    const newStorageCapacity = [...realWorldFactors.storageCapacity]
    while (newStorageCapacity.length < numSources) {
      newStorageCapacity.push(2000)
    }
    while (newStorageCapacity.length > numSources) {
      newStorageCapacity.pop()
    }
    setRealWorldFactors((prev) => ({ ...prev, storageCapacity: newStorageCapacity }))
  }, [numSources])

  useEffect(() => {
    // Adjust demands array
    const newDemands = [...demands]
    while (newDemands.length < numDestinations) {
      newDemands.push(800)
    }
    while (newDemands.length > numDestinations) {
      newDemands.pop()
    }
    setDemands(newDemands)
  }, [numDestinations])

  useEffect(() => {
    // Adjust cost and distance matrices
    const newCostMatrix = [...costMatrix]
    const newDistanceMatrix = [...distanceMatrix]
    const newRoadConditions = [...roadConditions]

    // Adjust rows
    while (newCostMatrix.length < numSources) {
      newCostMatrix.push(new Array(numDestinations).fill(10))
      newDistanceMatrix.push(new Array(numDestinations).fill(50))
      newRoadConditions.push(new Array(numDestinations).fill("good"))
    }
    while (newCostMatrix.length > numSources) {
      newCostMatrix.pop()
      newDistanceMatrix.pop()
      newRoadConditions.pop()
    }

    // Adjust columns
    for (let i = 0; i < newCostMatrix.length; i++) {
      while (newCostMatrix[i].length < numDestinations) {
        newCostMatrix[i].push(10)
        newDistanceMatrix[i].push(50)
        newRoadConditions[i].push("good")
      }
      while (newCostMatrix[i].length > numDestinations) {
        newCostMatrix[i].pop()
        newDistanceMatrix[i].pop()
        newRoadConditions[i].pop()
      }
    }

    setCostMatrix(newCostMatrix)
    setDistanceMatrix(newDistanceMatrix)
    setRoadConditions(newRoadConditions)
  }, [numSources, numDestinations])

  const handleAnalyze = () => {
    try {
      const solution = solveAdvancedTransportationProblem(
        supplies,
        demands,
        costMatrix,
        distanceMatrix,
        roadConditions,
        truckCapacity,
        realWorldFactors,
      )

      setResults(solution)
      setError("")
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis")
      setResults(null)
    }
  }

  const updateSupply = (index: number, value: number) => {
    const newSupplies = [...supplies]
    newSupplies[index] = value
    setSupplies(newSupplies)
  }

  const updateDemand = (index: number, value: number) => {
    const newDemands = [...demands]
    newDemands[index] = value
    setDemands(newDemands)
  }

  const updateCostMatrix = (i: number, j: number, value: number) => {
    const newMatrix = [...costMatrix]
    newMatrix[i][j] = value
    setCostMatrix(newMatrix)
  }

  const updateDistanceMatrix = (i: number, j: number, value: number) => {
    const newMatrix = [...distanceMatrix]
    newMatrix[i][j] = value
    setDistanceMatrix(newMatrix)
  }

  const updateRoadCondition = (i: number, j: number, value: string) => {
    const newConditions = [...roadConditions]
    newConditions[i][j] = value
    setRoadConditions(newConditions)
  }

  const updateStorageCapacity = (index: number, value: number) => {
    const newCapacity = [...realWorldFactors.storageCapacity]
    newCapacity[index] = value
    setRealWorldFactors((prev) => ({ ...prev, storageCapacity: newCapacity }))
  }

  const inputStyle = {
    padding: "5px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    width: "100%",
    marginBottom: "5px",
  }

  const selectStyle = {
    padding: "5px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    width: "100%",
    marginBottom: "5px",
  }

  const buttonStyle = {
    padding: "8px 15px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    cursor: "pointer",
    margin: "2px",
  }

  const tableStyle = {
    width: "100%",
    border: "1px solid #000",
    borderCollapse: "collapse" as const,
    marginBottom: "20px",
  }

  const cellStyle = {
    border: "1px solid #000",
    padding: "8px",
  }

  const headerStyle = {
    border: "1px solid #000",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold" as const,
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>Advanced Milk Distribution System</h1>
        <p style={{ fontSize: "16px", marginBottom: "5px" }}>Team 7 - BMFCA</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("setup")}
          style={{ ...buttonStyle, backgroundColor: activeTab === "setup" ? "#f0f0f0" : "#fff" }}
        >
          Setup
        </button>
        <button
          onClick={() => setActiveTab("supply-demand")}
          style={{ ...buttonStyle, backgroundColor: activeTab === "supply-demand" ? "#f0f0f0" : "#fff" }}
        >
          Supply & Demand
        </button>
        <button
          onClick={() => setActiveTab("transportation")}
          style={{ ...buttonStyle, backgroundColor: activeTab === "transportation" ? "#f0f0f0" : "#fff" }}
        >
          Transportation
        </button>
        <button
          onClick={() => setActiveTab("factors")}
          style={{ ...buttonStyle, backgroundColor: activeTab === "factors" ? "#f0f0f0" : "#fff" }}
        >
          Real-World Factors
        </button>
        <button
          onClick={() => setActiveTab("analysis")}
          style={{ ...buttonStyle, backgroundColor: activeTab === "analysis" ? "#f0f0f0" : "#fff" }}
        >
          Analysis
        </button>
      </div>

      {activeTab === "setup" && (
        <div style={{ border: "1px solid #000", padding: "15px", backgroundColor: "#fff" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>System Configuration</h2>

          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={cellStyle}>
                  <label>
                    <strong>Number of Collection Centers:</strong>
                    <br />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numSources}
                      onChange={(e) => setNumSources(Number.parseInt(e.target.value) || 1)}
                      style={inputStyle}
                    />
                    <small>Milk collection centers (sources)</small>
                  </label>
                </td>
                <td style={cellStyle}>
                  <label>
                    <strong>Number of Cities:</strong>
                    <br />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numDestinations}
                      onChange={(e) => setNumDestinations(Number.parseInt(e.target.value) || 1)}
                      style={inputStyle}
                    />
                    <small>Distribution destinations</small>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <label>
            <strong>Standard Truck Capacity (litres):</strong>
            <br />
            <input
              type="number"
              min="100"
              value={truckCapacity}
              onChange={(e) => setTruckCapacity(Number.parseInt(e.target.value) || 500)}
              style={inputStyle}
            />
            <small>Maximum capacity per truck</small>
          </label>
        </div>
      )}

      {activeTab === "supply-demand" && (
        <div style={{ border: "1px solid #000", padding: "15px", backgroundColor: "#fff" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Supply & Demand</h2>

          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                    Collection Centers Supply
                  </h3>
                  {Array.from({ length: numSources }).map((_, i) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <label>
                        <strong>Collection Center {i + 1}:</strong>
                        <br />
                        <input
                          type="number"
                          min="0"
                          value={supplies[i] || 0}
                          onChange={(e) => updateSupply(i, Number.parseInt(e.target.value) || 0)}
                          style={inputStyle}
                          placeholder="Daily supply in litres"
                        />
                        <small>litres/day</small>
                      </label>
                    </div>
                  ))}
                  <div style={{ border: "1px solid #000", padding: "5px", marginTop: "10px" }}>
                    <strong>Total Supply: {supplies.reduce((a, b) => a + b, 0)} litres/day</strong>
                  </div>
                </td>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>City Demand</h3>
                  {Array.from({ length: numDestinations }).map((_, i) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <label>
                        <strong>City {i + 1}:</strong>
                        <br />
                        <input
                          type="number"
                          min="0"
                          value={demands[i] || 0}
                          onChange={(e) => updateDemand(i, Number.parseInt(e.target.value) || 0)}
                          style={inputStyle}
                          placeholder="Daily demand in litres"
                        />
                        <small>litres/day</small>
                      </label>
                    </div>
                  ))}
                  <div style={{ border: "1px solid #000", padding: "5px", marginTop: "10px" }}>
                    <strong>Total Demand: {demands.reduce((a, b) => a + b, 0)} litres/day</strong>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "transportation" && (
        <div style={{ border: "1px solid #000", padding: "15px", backgroundColor: "#fff" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Transportation</h2>

          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Transportation Cost Matrix</h3>
          <p style={{ marginBottom: "10px" }}>Cost per litre from each collection center to each city</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>From / To</th>
                {Array.from({ length: numDestinations }).map((_, j) => (
                  <th key={j} style={headerStyle}>
                    City {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numSources }).map((_, i) => (
                <tr key={i}>
                  <td style={headerStyle}>Center {i + 1}</td>
                  {Array.from({ length: numDestinations }).map((_, j) => (
                    <td key={j} style={cellStyle}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={costMatrix[i]?.[j] || 0}
                        onChange={(e) => updateCostMatrix(i, j, Number.parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Distance Matrix</h3>
          <p style={{ marginBottom: "10px" }}>Distance in kilometers between centers and cities</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>From / To</th>
                {Array.from({ length: numDestinations }).map((_, j) => (
                  <th key={j} style={headerStyle}>
                    City {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numSources }).map((_, i) => (
                <tr key={i}>
                  <td style={headerStyle}>Center {i + 1}</td>
                  {Array.from({ length: numDestinations }).map((_, j) => (
                    <td key={j} style={cellStyle}>
                      <input
                        type="number"
                        min="0"
                        value={distanceMatrix[i]?.[j] || 0}
                        onChange={(e) => updateDistanceMatrix(i, j, Number.parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Road Conditions</h3>
          <p style={{ marginBottom: "10px" }}>Road quality affects fuel efficiency and delivery time</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>From / To</th>
                {Array.from({ length: numDestinations }).map((_, j) => (
                  <th key={j} style={headerStyle}>
                    City {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numSources }).map((_, i) => (
                <tr key={i}>
                  <td style={headerStyle}>Center {i + 1}</td>
                  {Array.from({ length: numDestinations }).map((_, j) => (
                    <td key={j} style={cellStyle}>
                      <select
                        value={roadConditions[i]?.[j] || "good"}
                        onChange={(e) => updateRoadCondition(i, j, e.target.value)}
                        style={{ ...selectStyle, width: "100px" }}
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="very-poor">Very Poor</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "factors" && (
        <div style={{ border: "1px solid #000", padding: "15px", backgroundColor: "#fff" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Real-World Factors</h2>

          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Economic Factors</h3>

                  <label>
                    <strong>Fuel Cost per Litre (₹):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.01"
                      value={realWorldFactors.fuelCostPerLiter}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          fuelCostPerLiter: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <strong>Driver Wage per Hour (₹):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.1"
                      value={realWorldFactors.driverWagePerHour}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          driverWagePerHour: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <strong>Maintenance Cost per KM (₹):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.01"
                      value={realWorldFactors.maintenanceCostPerKm}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          maintenanceCostPerKm: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <strong>Storage Cost per Litre per Day (₹):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.001"
                      value={realWorldFactors.storageCostPerLiter}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          storageCostPerLiter: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>
                </td>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Operational Factors</h3>

                  <label>
                    <strong>Spoilage Rate (%):</strong>
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={realWorldFactors.spoilageRate}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({ ...prev, spoilageRate: Number.parseFloat(e.target.value) }))
                      }
                      style={{ width: "100%", marginBottom: "5px" }}
                    />
                    <small>{realWorldFactors.spoilageRate}% spoilage rate</small>
                  </label>

                  <label>
                    <strong>Weather Condition:</strong>
                    <br />
                    <select
                      value={realWorldFactors.weatherCondition}
                      onChange={(e) => setRealWorldFactors((prev) => ({ ...prev, weatherCondition: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="normal">Normal</option>
                      <option value="rainy">Rainy</option>
                      <option value="stormy">Stormy</option>
                    </select>
                  </label>

                  <label>
                    <strong>Traffic Multiplier:</strong>
                    <br />
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={realWorldFactors.trafficMultiplier}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          trafficMultiplier: Number.parseFloat(e.target.value),
                        }))
                      }
                      style={{ width: "100%", marginBottom: "5px" }}
                    />
                    <small>{realWorldFactors.trafficMultiplier}x traffic impact</small>
                  </label>

                  <label>
                    <strong>Delivery Time Window (hours):</strong>
                    <br />
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={realWorldFactors.deliveryTimeWindow}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          deliveryTimeWindow: Number.parseInt(e.target.value) || 8,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Vehicle Performance</h3>

                  <label>
                    <strong>Fuel Efficiency - Good Roads (km/L):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.1"
                      value={realWorldFactors.fuelEfficiencyGoodRoad}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          fuelEfficiencyGoodRoad: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <strong>Fuel Efficiency - Poor Roads (km/L):</strong>
                    <br />
                    <input
                      type="number"
                      step="0.1"
                      value={realWorldFactors.fuelEfficiencyPoorRoad}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          fuelEfficiencyPoorRoad: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <strong>Vehicle Breakdown Probability (%):</strong>
                    <br />
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.1"
                      value={realWorldFactors.vehicleBreakdownProbability * 100}
                      onChange={(e) =>
                        setRealWorldFactors((prev) => ({
                          ...prev,
                          vehicleBreakdownProbability: Number.parseFloat(e.target.value) / 100,
                        }))
                      }
                      style={{ width: "100%", marginBottom: "5px" }}
                    />
                    <small>
                      {(realWorldFactors.vehicleBreakdownProbability * 100).toFixed(1)}% breakdown probability
                    </small>
                  </label>
                </td>
                <td style={cellStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Storage Capacity</h3>
                  {Array.from({ length: numSources }).map((_, i) => (
                    <label key={i}>
                      <strong>Collection Center {i + 1} Storage (litres):</strong>
                      <br />
                      <input
                        type="number"
                        min="0"
                        value={realWorldFactors.storageCapacity[i] || 0}
                        onChange={(e) => updateStorageCapacity(i, Number.parseInt(e.target.value) || 0)}
                        style={inputStyle}
                      />
                    </label>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "analysis" && (
        <div style={{ border: "1px solid #000", padding: "10px", backgroundColor: "#fff" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>Analysis Results</h2>

          <button
            onClick={handleAnalyze}
            style={{
              padding: "10px 20px",
              border: "1px solid #000",
              backgroundColor: "#fff",
              cursor: "pointer",
              marginBottom: "20px",
              width: "100%",
            }}
          >
            Run Advanced Analysis
          </button>

          {error && (
            <div style={{ border: "1px solid #000", padding: "10px", marginBottom: "20px" }}>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "10px", textAlign: "center" }}>
                        <strong>Total Cost</strong>
                        <br />₹{results.totalCost.toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "10px", textAlign: "center" }}>
                        <strong>Total Distance</strong>
                        <br />
                        {results.totalDistance} km
                      </td>
                      <td style={{ border: "1px solid #000", padding: "10px", textAlign: "center" }}>
                        <strong>Total Trips</strong>
                        <br />
                        {results.totalTrips}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                  Optimal Distribution Plan
                </h3>
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th style={headerStyle}>Route</th>
                      <th style={headerStyle}>Quantity</th>
                      <th style={headerStyle}>Distance</th>
                      <th style={headerStyle}>Road Condition</th>
                      <th style={headerStyle}>Trips</th>
                      <th style={headerStyle}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.allocation.map((alloc: any, i: number) => (
                      <tr key={i}>
                        <td style={cellStyle}>
                          Center {alloc.source + 1} → City {alloc.destination + 1}
                        </td>
                        <td style={cellStyle}>{alloc.quantity} L</td>
                        <td style={cellStyle}>{alloc.distance} km</td>
                        <td style={cellStyle}>{alloc.roadCondition}</td>
                        <td style={cellStyle}>{alloc.trips}</td>
                        <td style={cellStyle}>₹{alloc.routeCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>Cost Breakdown</h3>
                <table style={tableStyle}>
                  <tbody>
                    <tr>
                      <td style={cellStyle}>
                        <strong>Transportation:</strong> ₹{results.costBreakdown.transportation.toFixed(2)}
                      </td>
                      <td style={cellStyle}>
                        <strong>Fuel:</strong> ₹{results.costBreakdown.fuel.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td style={cellStyle}>
                        <strong>Labor:</strong> ₹{results.costBreakdown.labor.toFixed(2)}
                      </td>
                      <td style={cellStyle}>
                        <strong>Maintenance:</strong> ₹{results.costBreakdown.maintenance.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                  Poor Road Infrastructure Impact
                </h3>
                <div style={{ border: "1px solid #000", padding: "10px" }}>
                  <p>
                    <strong>Routes affected by poor road conditions:</strong> {results.poorRoadRoutes}
                  </p>
                  <p>
                    <strong>Additional fuel cost:</strong> ₹{results.additionalFuelCost.toFixed(2)}
                  </p>
                  <p>
                    <strong>Increased delivery time:</strong> {results.additionalDeliveryTime.toFixed(1)} hours
                  </p>
                  <p>
                    <strong>Reduced vehicle efficiency:</strong> {results.efficiencyReduction.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                  Optimization Recommendations
                </h3>
                <div style={{ border: "1px solid #000", padding: "10px" }}>
                  <ul>
                    {results.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
