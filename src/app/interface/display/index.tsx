
export function Display ({ assetUrl }: { assetUrl: string }) {
  return (
    <>
      <img
        src={assetUrl || undefined}
        className="fixed w-screen top-0 left-0 right-0"
      />
    </>
  )
}