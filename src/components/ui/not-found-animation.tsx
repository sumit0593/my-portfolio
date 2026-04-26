export default function NotFoundAnimation() {
  return (
    <div className="h-[400px] w-full flex flex-col items-center justify-center">
      <div className="animate-bounce">
        <h1 className="text-8xl md:text-9xl font-extrabold text-red-500 tracking-widest drop-shadow-xl select-none">
          404
        </h1>
      </div>
      <p className="mt-4 text-muted-foreground text-lg text-center animate-pulse">Page Not Found</p>
    </div>
  );
}
