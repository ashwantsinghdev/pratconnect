const FriendsEmpty = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2">
      <i className="ri-chat-3-line text-4xl text-muted-foreground"></i>
      <p className="text-muted-foreground">
        Select a friend on the left to start chatting
      </p>
    </div>
  );
};

export default FriendsEmpty;
