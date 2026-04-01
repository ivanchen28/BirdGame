import birdsData from '../assets/data/birds.json'
import type { BirdCard } from './types/BirdCard'
import { BirdDisplay } from './components/BirdDisplay'

const birds: BirdCard[] = birdsData as BirdCard[]

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 p-8">
      <div className="grid grid-cols-6 gap-4">
        {birds.map(bird => (
          <BirdDisplay key={bird.id} bird={bird} cardHeight={400} />
        ))}
      </div>
    </div>
  )
}

export default App
