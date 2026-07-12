import Posts from "./Posts"


const Dashboard=()=>{
    return (
      <div className="p-4 ">
        <Posts showComposer={false} />
      </div>
    );
}

export default Dashboard