class RuntimeEnv { 
    private y: number = 0; 

    public getY(): number { return this.y; }
    
    private runtime = this; 

	public Constant = () => {
        return {
            testSetOuterPrivate(target: number) {
                this.superThis.y = target;
            }
        };
    }
}

const x1: classX = new classX();
alert(x1.getY());

x1.utilities.testSetOuterPrivate(4);
alert(x1.getY());