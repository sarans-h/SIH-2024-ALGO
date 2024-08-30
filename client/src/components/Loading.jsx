import { HashLoader } from 'react-spinners'

export default function Loading() {
    return (
        <div className="loading-spinner">
            <HashLoader
                color="#4c87b1"
                size={100}
                speedMultiplier={1.5}
            />
        </div>
    )
}
