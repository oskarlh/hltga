@if "%~d1"=="" (
	echo Drag and drop an image file ^(PNG, WebP, TIFF, GIF, JPEG, SVG^) onto this .bat file
	echo The result will be stored in game.tga in the same folder as the source image file
	echo GLHF
) else (
	"%~dp0scripts\node.exe" scripts\index.js "%~f1" "%~dp1game.tga"
	echo Done
)
@pause
