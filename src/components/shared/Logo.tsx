const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-sm">P</span>
      </div>
      <span className="font-semibold text-lg text-foreground">
        Prat
        <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">
          Connect
        </span>
      </span>
    </div>
  );
};

export default Logo;
