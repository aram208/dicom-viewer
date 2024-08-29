import { Link } from '@mui/material'
import imgPatience from './../../assets/patience_you_must_have.jpg'
function HavePatienceMeme(){
    return (
        <>
        <div style={{textAlign: 'center'}}>
        <img src={imgPatience} alt='Patience you must have'/>
        <br/>
        <Link href="/dashboard">Dashboard</Link>
        </div>
        </>
    )
}
export default HavePatienceMeme