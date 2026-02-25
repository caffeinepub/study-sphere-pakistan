module {
  type Actor = {
    adminPasswordHash : Text;
  };

  public func run(old : Actor) : Actor {
    { old with adminPasswordHash = "6b3a55e0261b0304143f805a24924d0c1c44524821305f31d9277843b8a10f4e" };
  };
};
