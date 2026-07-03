const AuthBackdrop = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute top-16 left-10 w-20 h-20 rounded-full bg-[#F5F0E6] shadow-sm" />
      <div className="absolute top-10 right-24 w-40 h-32 rounded-[45%_55%_60%_40%] bg-[#2F5233]" />
      <div className="absolute top-1/2 left-6 w-16 h-16 rounded-full bg-[#A8DDD0]" />
      <div className="absolute bottom-16 right-16 w-28 h-28 rounded-full bg-[#D9A441]" />
      <div className="absolute bottom-10 left-16 w-32 h-28 rounded-[50%_50%_60%_40%] bg-[#1C2333]" />
    </div>
  );
};

export default AuthBackdrop;
