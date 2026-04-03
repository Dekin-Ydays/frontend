{
  description = "Dekin Infrastructure Development Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.default = pkgs.mkShellNoCC {
        packages = [
          pkgs.nodejs_20
          pkgs.watchman
        ];

        shellHook = ''
          unset DEVELOPER_DIR SDKROOT CC CXX LD AR AS NM RANLIB STRIP \
                NIX_CC NIX_BINTOOLS NIX_CFLAGS_COMPILE NIX_LDFLAGS \
                MACOSX_DEPLOYMENT_TARGET NIX_APPLE_SDK_VERSION \
                NIX_HARDENING_ENABLE NIX_ENFORCE_NO_NATIVE
        '';
      };
    });
}
